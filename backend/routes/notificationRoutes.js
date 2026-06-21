const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticateUser } = require('../middleware/auth');
const ErrorResponse = require('../utils/errorResponse');

// All notification routes require authentication
router.use(authenticateUser);

/**
 * @desc    Get user notifications
 * @route   GET /api/notifications
 */
router.get('/', async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Mark a notification as read
 * @route   PUT /api/notifications/:id/read
 */
router.put('/:id/read', async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    // Check ownership
    if (notification.userId.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this notification', 403));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 */
router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
