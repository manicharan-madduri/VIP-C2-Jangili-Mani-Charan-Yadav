const { validationResult } = require('express-validator');

/**
 * Middleware to check for express-validator results.
 * If errors exist, respond with 400 and the detailed errors.
 */
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
    });
  }
  next();
};

module.exports = validateFields;
