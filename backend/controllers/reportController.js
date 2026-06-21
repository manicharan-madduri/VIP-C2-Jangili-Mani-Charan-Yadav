const Report = require('../models/Report');
const Doctor = require('../models/Doctor');
const ErrorResponse = require('../utils/errorResponse');
const { createNotification } = require('../services/notificationService');
const fs = require('fs');
const path = require('path');

/**
 * @desc    Upload medical report (PDF / Image)
 * @route   POST /api/reports/upload
 * @access  Private (Patient only)
 */
const uploadReport = async (req, res, next) => {
  const { doctorId, appointmentId, fileType } = req.body;

  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    // Verify doctor exists
    const doctorProfile = await Doctor.findById(doctorId);
    if (!doctorProfile) {
      // Clean up uploaded file if DB validation fails
      if (req.file.path) fs.unlinkSync(req.file.path);
      return next(new ErrorResponse('Assigned doctor profile not found', 404));
    }

    // Define public file path/url (local fallback serving route)
    const fileUrl = `/uploads/${req.file.filename}`;

    const report = await Report.create({
      patientId: req.user.id,
      doctorId,
      appointmentId: appointmentId || undefined,
      fileUrl,
      fileName: req.file.originalname,
      fileType: fileType || (req.file.mimetype === 'application/pdf' ? 'PDF' : 'Image')
    });

    // Notify doctor
    await createNotification(
      doctorProfile.userId,
      `Patient ${req.user.name} uploaded a medical report: ${req.file.originalname}`
    );

    res.status(201).json({
      success: true,
      message: 'Report uploaded successfully',
      report
    });
  } catch (error) {
    // Clean up uploaded file in case of exception
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path); } catch (e) { console.error(e); }
    }
    next(error);
  }
};

/**
 * @desc    Get reports (role-based)
 * @route   GET /api/reports
 * @access  Private
 */
const getReports = async (req, res, next) => {
  try {
    let reports;

    if (req.user.role === 'patient') {
      reports = await Report.find({ patientId: req.user.id })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name specialization' }
        })
        .sort({ uploadedAt: -1 });
    } else if (req.user.role === 'doctor') {
      const doctorProfile = await Doctor.findOne({ userId: req.user.id });
      if (!doctorProfile) {
        return next(new ErrorResponse('Doctor profile not found', 404));
      }
      reports = await Report.find({ doctorId: doctorProfile._id })
        .populate('patientId', 'name email phone')
        .sort({ uploadedAt: -1 });
    } else if (req.user.role === 'admin') {
      reports = await Report.find()
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name specialization' }
        })
        .populate('patientId', 'name email')
        .sort({ uploadedAt: -1 });
    }

    res.status(200).json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single report by ID
 * @route   GET /api/reports/:id
 * @access  Private
 */
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('patientId', 'name')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'name' }
      });

    if (!report) {
      return next(new ErrorResponse('Medical report not found', 404));
    }

    // Role-based auth check
    const isPatientOwner = report.patientId._id.toString() === req.user.id;
    const isDoctorOwner = report.doctorId.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isPatientOwner && !isDoctorOwner && !isAdmin) {
      return next(new ErrorResponse('Not authorized to access this report', 403));
    }

    res.status(200).json({
      success: true,
      report
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete report
 * @route   DELETE /api/reports/:id
 * @access  Private (Patient owner only)
 */
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return next(new ErrorResponse('Medical report not found', 404));
    }

    // Check ownership
    if (report.patientId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this report', 403));
    }

    // Remove local file
    const localPath = path.join(__dirname, '..', report.fileUrl);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    await report.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadReport,
  getReports,
  getReportById,
  deleteReport
};
