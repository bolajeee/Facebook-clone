/**
 * Notifications Routes
 * Handles real-time notifications
 */

const express = require('express');
const router = express.Router();

// Import controllers
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getNotificationSettings,
    updateNotificationSettings
} = require('../controllers/notificationController');

// Import middleware
const { authenticate } = require('../middleware/auth');
const { validateQuery } = require('../utils/validation');
const { validatePagination } = require('../utils/validation');

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications with pagination
 * @access  Private
 * @query   { cursor?, limit?, unreadOnly? }
 */
router.get('/',
    authenticate,
    validateQuery(validatePagination),
    getNotifications
);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count',
    authenticate,
    getUnreadCount
);

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:notificationId/read',
    authenticate,
    markAsRead
);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all',
    authenticate,
    markAllAsRead
);

/**
 * @route   DELETE /api/notifications/:notificationId
 * @desc    Delete a notification
 * @access  Private
 */
router.delete('/:notificationId',
    authenticate,
    deleteNotification
);

/**
 * @route   DELETE /api/notifications/read
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read',
    authenticate,
    deleteAllRead
);

/**
 * @route   GET /api/notifications/settings
 * @desc    Get notification settings
 * @access  Private
 */
router.get('/settings',
    authenticate,
    getNotificationSettings
);

/**
 * @route   PUT /api/notifications/settings
 * @desc    Update notification settings
 * @access  Private
 */
router.put('/settings',
    authenticate,
    updateNotificationSettings
);

module.exports = router;