const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Report = require('../models/Report');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Get all users (patients and doctors)
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doctors (approved, pending, rejected)
 * @route   GET /api/admin/doctors
 * @access  Private (Admin only)
 */
const getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('userId', 'name email phone createdAt')
      .sort({ approvalStatus: 1, _id: -1 }); // Pending first

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a doctor profile
 * @route   PUT /api/admin/approve-doctor/:id
 * @access  Private (Admin only)
 */
const approveDoctor = async (req, res, next) => {
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    doctor.approvalStatus = 'approved';
    await doctor.save();

    // Notify doctor
    await createNotification(
      doctor.userId,
      'Congratulations! Your doctor profile has been approved. You are now active in search listings.'
    );

    res.status(200).json({
      success: true,
      message: 'Doctor profile approved successfully',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a doctor profile
 * @route   PUT /api/admin/reject-doctor/:id
 * @access  Private (Admin only)
 */
const rejectDoctor = async (req, res, next) => {
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    doctor.approvalStatus = 'rejected';
    await doctor.save();

    // Notify doctor
    await createNotification(
      doctor.userId,
      'Your doctor profile request was rejected. Please verify your credentials/details.'
    );

    res.status(200).json({
      success: true,
      message: 'Doctor profile rejected successfully',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete/Suspend user account (Cascading deletes)
 * @route   DELETE /api/admin/user/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Cascading deletes based on role
    if (user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: user._id });
      if (doctorProfile) {
        // Delete appointments associated with doctor
        await Appointment.deleteMany({ doctorId: doctorProfile._id });
        // Delete doctor profile
        await doctorProfile.deleteOne();
      }
    } else if (user.role === 'patient') {
      // Delete appointments associated with patient
      await Appointment.deleteMany({ patientId: user._id });
      // Delete medical reports uploaded by patient
      await Report.deleteMany({ patientId: user._id });
    }

    // Delete base user record
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User (${user.role}) and all associated records removed successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Platform Statistics & Analytics
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
const getPlatformStats = async (req, res, next) => {
  try {
    // 1. Basic counts
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });

    // 2. Doctor status counts
    const doctorStats = await Doctor.aggregate([
      {
        $group: {
          _id: '$approvalStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const doctorStatusCounts = { pending: 0, approved: 0, rejected: 0 };
    doctorStats.forEach(stat => {
      if (stat._id === 'pending') doctorStatusCounts.pending = stat.count;
      if (stat._id === 'approved') doctorStatusCounts.approved = stat.count;
      if (stat._id === 'rejected') doctorStatusCounts.rejected = stat.count;
    });

    // 3. Appointment status counts
    const appointmentStats = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const appointmentStatusCounts = { Pending: 0, Approved: 0, Rejected: 0, Completed: 0, Cancelled: 0 };
    appointmentStats.forEach(stat => {
      if (appointmentStatusCounts[stat._id] !== undefined) {
        appointmentStatusCounts[stat._id] = stat.count;
      }
    });

    // 4. Calculate Platform Earnings/Revenue (Using aggregation pipeline)
    // Joined with Doctor to fetch the fee of completed appointments
    const revenueStats = await Appointment.aggregate([
      { $match: { status: 'Completed' } },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctorId',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      { $unwind: '$doctorInfo' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$doctorInfo.consultationFee' }
        }
      }
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    // 5. Fetch 5 recent appointments
    const recentAppointments = await Appointment.find()
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name specialization' }
      })
      .populate('patientId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors
        },
        doctorsByStatus: doctorStatusCounts,
        appointmentsByStatus: appointmentStatusCounts,
        totalRevenue,
        recentAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getDoctors,
  approveDoctor,
  rejectDoctor,
  deleteUser,
  getPlatformStats
};
