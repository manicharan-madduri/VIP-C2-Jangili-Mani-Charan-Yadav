const express = require('express');
const router = express.Router();
const {
  getUsers,
  getDoctors,
  approveDoctor,
  rejectDoctor,
  deleteUser,
  getPlatformStats
} = require('../controllers/adminController');
const { authenticateUser, verifyAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin credentials
router.use(authenticateUser, verifyAdmin);

router.get('/users', getUsers);
router.get('/doctors', getDoctors);
router.put('/approve-doctor/:id', approveDoctor);
router.put('/reject-doctor/:id', rejectDoctor);
router.delete('/user/:id', deleteUser);
router.get('/dashboard', getPlatformStats);

module.exports = router;
