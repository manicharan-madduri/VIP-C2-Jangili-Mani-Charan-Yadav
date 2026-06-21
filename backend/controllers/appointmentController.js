const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Book a new appointment
 * @route   POST /api/appointments
 * @access  Private (Patient only)
 */
const bookAppointment = async (req, res, next) => {
  const { doctorId, date, time, reason } = req.body;

  try {
    // Check if doctor exists and is approved
    const doctor = await Doctor.findById(doctorId).populate('userId', 'name');
    if (!doctor || doctor.approvalStatus !== 'approved') {
      return next(new ErrorResponse('Doctor is not available or not approved', 400));
    }

    // Parse date to remove time parts and match strictly
    const appointmentDate = new Date(date);

    // Check for double booking (same doctor, same date, same time slot)
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      time,
      status: { $in: ['Pending', 'Approved'] }
    });

    if (existingAppointment) {
      return next(new ErrorResponse('This time slot is already booked for this doctor', 400));
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientId: req.user.id,
      date: appointmentDate,
      time,
      reason,
      status: 'Pending'
    });

    // Notify doctor
    await createNotification(
      doctor.userId._id,
      `New appointment request from ${req.user.name} for ${appointmentDate.toLocaleDateString()} at ${time}`
    );

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Status: Pending approval.',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all appointments (Filtered by user role)
 * @route   GET /api/appointments
 * @access  Private
 */
const getAppointments = async (req, res, next) => {
  try {
    let appointments;

    if (req.user.role === 'patient') {
      appointments = await Appointment.find({ patientId: req.user.id })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone' }
        })
        .sort({ date: 1, time: 1 });
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (!doctorProfile) {
        return next(new ErrorResponse('Doctor profile not found', 404));
      }
      appointments = await Appointment.find({ doctorId: doctorProfile._id })
        .populate('patientId', 'name email phone')
        .sort({ date: 1, time: 1 });
    } else if (req.user.role === 'admin') {
      appointments = await Appointment.find()
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone' }
        })
        .populate('patientId', 'name email phone')
        .sort({ date: -1 });
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single appointment details
 * @route   GET /api/appointments/:id
 * @access  Private
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name email phone' }
      })
      .populate('patientId', 'name email phone');

    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    // Verify ownership
    const isPatient = appointment.patientId._id.toString() === req.user.id;
    const isDoctor = appointment.doctorId.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatient && !isDoctor && !isAdmin) {
      return next(new ErrorResponse('Not authorized to view this appointment', 403));
    }

    res.status(200).json({
      success: true,
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update appointment details/status (Approve, Reject, Cancel, Reschedule)
 * @route   PUT /api/appointments/:id
 * @access  Private
 */
const updateAppointment = async (req, res, next) => {
  const { status, date, time } = req.body;

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    const doctorProfile = await Doctor.findById(appointment.doctorId).populate('userId', 'name');
    const isPatientOwner = appointment.patientId.toString() === req.user.id;
    const isDoctorOwner = doctorProfile.userId._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // 1. Reschedule action (Patient or Admin or Doctor)
    if (date || time) {
      if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
        return next(new ErrorResponse('Not authorized to reschedule this appointment', 403));
      }
      
      const newDate = date ? new Date(date) : appointment.date;
      const newTime = time || appointment.time;

      // Double-booking check
      const duplicate = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctorId: appointment.doctorId,
        date: newDate,
        time: newTime,
        status: { $in: ['Pending', 'Approved'] }
      });

      if (duplicate) {
        return next(new ErrorResponse('This rescheduled slot is already booked', 400));
      }

      appointment.date = newDate;
      appointment.time = newTime;
      appointment.status = 'Pending'; // Reset to pending approval upon reschedule
      
      // Notify other party
      if (isPatientOwner) {
        await createNotification(
          doctorProfile.userId._id,
          `Patient ${req.user.name} rescheduled their appointment to ${newDate.toLocaleDateString()} at ${newTime}.`
        );
      } else {
        await createNotification(
          appointment.patientId,
          `Dr. ${doctorProfile.userId.name} rescheduled your appointment to ${newDate.toLocaleDateString()} at ${newTime}.`
        );
      }
    }

    // 2. Status change action
    if (status) {
      // Validate transition roles
      if (['Approved', 'Rejected', 'Completed'].includes(status) && !isDoctorOwner && !isAdmin) {
        return next(new ErrorResponse('Only the doctor or admin can Approve/Reject/Complete appointments', 403));
      }

      if (status === 'Cancelled' && !isPatientOwner && !isDoctorOwner && !isAdmin) {
        return next(new ErrorResponse('Not authorized to cancel this appointment', 403));
      }

      appointment.status = status;

      // Trigger notifications
      if (status === 'Approved') {
        await createNotification(
          appointment.patientId,
          `Your appointment with Dr. ${doctorProfile.userId.name} on ${appointment.date.toLocaleDateString()} has been Approved.`
        );
      } else if (status === 'Rejected') {
        await createNotification(
          appointment.patientId,
          `Your appointment with Dr. ${doctorProfile.userId.name} on ${appointment.date.toLocaleDateString()} has been Rejected.`
        );
      } else if (status === 'Cancelled') {
        if (isPatientOwner) {
          await createNotification(
            doctorProfile.userId._id,
            `Patient ${req.user.name} cancelled their appointment for ${appointment.date.toLocaleDateString()} at ${appointment.time}.`
          );
        } else {
          await createNotification(
            appointment.patientId,
            `Dr. ${doctorProfile.userId.name} cancelled your appointment for ${appointment.date.toLocaleDateString()} at ${appointment.time}.`
          );
        }
      }
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add prescription notes & mark appointment completed
 * @route   PUT /api/appointments/:id/prescription
 * @access  Private (Doctor only)
 */
const addPrescription = async (req, res, next) => {
  const { prescription } = req.body;

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return next(new ErrorResponse('Appointment not found', 404));
    }

    // Check if user is the assigned doctor
    const doctorProfile = await Doctor.findById(appointment.doctorId);
    if (doctorProfile.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to add prescriptions for this appointment', 403));
    }

    appointment.prescription = prescription;
    appointment.status = 'Completed'; // Automatically complete appointment on prescription note
    await appointment.save();

    await createNotification(
      appointment.patientId,
      `Dr. ${req.user.name} added prescription notes to your appointment on ${appointment.date.toLocaleDateString()}.`
    );

    res.status(200).json({
      success: true,
      message: 'Prescription added and appointment marked as completed',
      appointment
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  addPrescription
};
