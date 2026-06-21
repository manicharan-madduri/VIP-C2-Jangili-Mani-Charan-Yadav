const express = require('express');
const router = express.Router();
const {
  uploadReport,
  getReports,
  getReportById,
  deleteReport
} = require('../controllers/reportController');
const { authenticateUser, verifyPatient } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All report routes require authentication
router.use(authenticateUser);

// Upload a report (requires file field name 'reportFile')
router.post('/upload', verifyPatient, upload.single('reportFile'), uploadReport);

router.get('/', getReports);
router.get('/:id', getReportById);
router.delete('/:id', deleteReport);

module.exports = router;
