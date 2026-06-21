const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidator');
const validateFields = require('../middleware/validate');
const { authenticateUser } = require('../middleware/auth');

// Public auth routes
router.post('/register', registerRules, validateFields, registerUser);
router.post('/login', loginRules, validateFields, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Private profile routes
router.get('/profile', authenticateUser, getUserProfile);
router.put('/profile', authenticateUser, updateUserProfile);
router.post('/logout', authenticateUser, logoutUser);

module.exports = router;
