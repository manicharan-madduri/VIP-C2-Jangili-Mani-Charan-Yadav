const express = require('express');
const router = express.Router();
const {
  bookAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  addPrescription
} = require('../controllers/appointmentController');
const { authenticateUser, verifyPatient, verifyDoctor } = require('../middleware/auth');

// All appointment routes require authentication
router.use(authenticateUser);

router.post('/', verifyPatient, bookAppointment);
router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.put('/:id', updateAppointment);
router.put('/:id/prescription', verifyDoctor, addPrescription);

module.exports = router;
