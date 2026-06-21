const User = require('../models/User');
const Doctor = require('../models/Doctor');
const ErrorResponse = require('../utils/errorResponse');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const crypto = require('crypto');

// Map to store reset tokens temporarily (in-memory for simple standalone run without complex mail setups)
const resetTokens = new Map();

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new ErrorResponse('User already exists with this email', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient',
      phone
    });

    // If role is doctor, create a default doctor profile
    if (user.role === 'doctor') {
      await Doctor.create({
        userId: user._id,
        specialization: 'General Medicine', // Default placeholders to be updated
        qualification: 'MBBS',
        experience: 0,
        hospital: 'General Hospital',
        consultationFee: 500,
        approvalStatus: 'pending'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get tokens
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Get associated doctor profile if doctor
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutUser = async (req, res, next) => {
  // In a production app with refresh token blacklist, we would invalidate the token in Redis/Database.
  // Here, we respond positively and the frontend clears local tokens.
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

/**
 * @desc    Forgot Password (initiates reset)
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse('No user found with that email', 404));
    }

    // Generate random 6-digit pin or token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const expireTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store in-memory for simpler deployment
    resetTokens.set(resetToken, { userId: user._id, expires: expireTime });

    // In production, we'd send an email. For this task, we return the token in the API for demo purposes
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'Password reset token generated. In production, this goes to email.',
      resetToken // Return for easier frontend demonstration / API testing
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reset password using token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  try {
    const tokenData = resetTokens.get(token);
    
    if (!tokenData || tokenData.expires < Date.now()) {
      return next(new ErrorResponse('Invalid or expired reset token', 400));
    }

    const user = await User.findById(tokenData.userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Remove token
    resetTokens.delete(token);

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Update base user details
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.email && req.body.email !== user.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return next(new ErrorResponse('Email already in use', 400));
      }
      user.email = req.body.email;
    }

    // Handle password change if requested
    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    // Update doctor profile details if user is a doctor
    let doctorProfile = null;
    if (user.role === 'doctor') {
      doctorProfile = await Doctor.findOne({ userId: user._id });
      if (doctorProfile) {
        doctorProfile.specialization = req.body.specialization || doctorProfile.specialization;
        doctorProfile.qualification = req.body.qualification || doctorProfile.qualification;
        doctorProfile.experience = req.body.experience !== undefined ? req.body.experience : doctorProfile.experience;
        doctorProfile.hospital = req.body.hospital || doctorProfile.hospital;
        doctorProfile.consultationFee = req.body.consultationFee !== undefined ? req.body.consultationFee : doctorProfile.consultationFee;
        doctorProfile.availableDays = req.body.availableDays || doctorProfile.availableDays;
        doctorProfile.availableTimeSlots = req.body.availableTimeSlots || doctorProfile.availableTimeSlots;
        
        // Handle profile image if updated
        if (req.body.profileImage) {
          doctorProfile.profileImage = req.body.profileImage;
        }

        await doctorProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        doctorProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile
};
