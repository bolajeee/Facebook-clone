/**
 * Authentication Routes
 * Handles user registration, login, logout, and token refresh
 */

const express = require('express');
const router = express.Router();

// Import controllers and middleware
const {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    changePassword
} = require('../controllers/authController');

const { authenticate, authRateLimit } = require('../middleware/auth');
const { validateBody } = require('../utils/validation');
const {
    validateRegister,
    validateLogin,
    validatePasswordChange
} = require('../utils/validation');

// Apply rate limiting to auth routes
const loginRateLimit = authRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
const registerRateLimit = authRateLimit(3, 15 * 60 * 1000); // 3 attempts per hour

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @body    { email, username, password, firstName, lastName }
 */
router.post('/register',
    registerRateLimit,
    validateBody(validateRegister),
    register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 * @body    { identifier, password } - identifier can be email or username
 */
router.post('/login',
    loginRateLimit,
    validateBody(validateLogin),
    login
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 * @body    { refreshToken }
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Private
 */
router.post('/logout', authenticate, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 * @body    { currentPassword, newPassword }
 */
router.put('/change-password',
    authenticate,
    validateBody(validatePasswordChange),
    changePassword
);

module.exports = router;