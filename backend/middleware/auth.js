const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Protect routes by validating JWT access token in the Authorization header.
 */
const authenticateUser = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretaccesskey123!@#');

      // Get user from database, omit password
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return next(new ErrorResponse('Not authorized, user not found', 401));
      }

      next();
    } catch (error) {
      return next(error); // will be caught by JsonWebTokenError / TokenExpiredError in errorHandler
    }
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized, no token provided', 401));
  }
};

/**
 * Limit access to Patient users only.
 */
const verifyPatient = (req, res, next) => {
  if (req.user && req.user.role === 'patient') {
    next();
  } else {
    return next(new ErrorResponse('Access denied: Patients only', 403));
  }
};

/**
 * Limit access to Doctor users only.
 */
const verifyDoctor = (req, res, next) => {
  if (req.user && req.user.role === 'doctor') {
    next();
  } else {
    return next(new ErrorResponse('Access denied: Doctors only', 403));
  }
};

/**
 * Limit access to Admin users only.
 */
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new ErrorResponse('Access denied: Administrators only', 403));
  }
};

module.exports = {
  authenticateUser,
  verifyPatient,
  verifyDoctor,
  verifyAdmin
};
