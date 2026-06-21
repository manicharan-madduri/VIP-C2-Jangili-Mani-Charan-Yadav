const jwt = require('jsonwebtoken');

/**
 * Generate Access Token
 * @param {string} id - User ID
 */
const generateAccessToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecretaccesskey123!@#',
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
};

/**
 * Generate Refresh Token
 * @param {string} id - User ID
 */
const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey456$%^',
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
