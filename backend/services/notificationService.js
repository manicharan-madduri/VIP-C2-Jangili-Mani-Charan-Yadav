const Notification = require('../models/Notification');

/**
 * Creates and saves an in-app notification.
 * @param {string} userId - ID of the target user.
 * @param {string} message - Content of the notification.
 * @returns {Promise<Object>} The saved notification.
 */
const createNotification = async (userId, message) => {
  try {
    const notification = new Notification({
      userId,
      message
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error(`Failed to create notification: ${error.message}`);
    // Non-blocking error, do not throw
  }
};

module.exports = {
  createNotification
};
