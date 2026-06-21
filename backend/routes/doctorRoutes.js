const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile,
  deleteDoctorProfile
} = require('../controllers/doctorController');
const { authenticateUser, verifyDoctor, verifyAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctorById);

// Protected routes
router.post('/', authenticateUser, verifyDoctor, createDoctorProfile);
router.put('/:id', authenticateUser, updateDoctorProfile);
router.delete('/:id', authenticateUser, verifyAdmin, deleteDoctorProfile);

module.exports = router;
