const Doctor = require('../models/Doctor');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * @desc    Get all approved doctors with filtering, search, sorting and pagination
 * @route   GET /api/doctors
 * @access  Public
 */
const getDoctors = async (req, res, next) => {
  try {
    const { 
      search, 
      specialization, 
      hospital, 
      experience, 
      minFee, 
      maxFee, 
      sortBy, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build query
    const query = { approvalStatus: 'approved' };

    // Apply direct filters
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (hospital) {
      query.hospital = { $regex: hospital, $options: 'i' };
    }

    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    // Handle search by doctor name (requires querying User first)
    if (search) {
      const users = await User.find({
        role: 'doctor',
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      
      // Combine search condition: either the name matches (userIds in array) OR hospital/specialization matches search
      query.$or = [
        { userId: { $in: userIds } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospital: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort setup
    let sortOptions = {};
    if (sortBy === 'fee_low') {
      sortOptions.consultationFee = 1;
    } else if (sortBy === 'fee_high') {
      sortOptions.consultationFee = -1;
    } else if (sortBy === 'experience') {
      sortOptions.experience = -1;
    } else {
      sortOptions.createdAt = -1; // default
    }

    // Pagination calculations
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Run query
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('userId', 'name email phone')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: doctors.length,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      },
      doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single doctor details by ID
 * @route   GET /api/doctors/:id
 * @access  Public
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('userId', 'name email phone');
    
    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create doctor profile details
 * @route   POST /api/doctors
 * @access  Private (Doctor only)
 */
const createDoctorProfile = async (req, res, next) => {
  try {
    // Check if profile already exists
    let doctor = await Doctor.findOne({ userId: req.user.id });
    if (doctor) {
      return next(new ErrorResponse('Doctor profile already exists. Use PUT to update.', 400));
    }

    // Add user reference to body
    req.body.userId = req.user.id;

    doctor = await Doctor.create(req.body);

    res.status(201).json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update doctor profile details
 * @route   PUT /api/doctors/:id
 * @access  Private (Doctor owner / Admin)
 */
const updateDoctorProfile = async (req, res, next) => {
  try {
    let doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    // Check ownership (must be the doctor themselves, or admin)
    if (doctor.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this profile', 403));
    }

    // Filter fields that can be updated (prevent changing approval status here)
    const updateData = { ...req.body };
    delete updateData.approvalStatus;
    delete updateData.userId;

    doctor = await Doctor.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    }).populate('userId', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete doctor profile (Admin only)
 * @route   DELETE /api/doctors/:id
 * @access  Private (Admin only)
 */
const deleteDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    await doctor.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Doctor profile removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile
};
