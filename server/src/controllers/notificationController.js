/**
 * Notification Controller
 * Handles notification retrieval, marking as read, and deletion
 */

const { prisma } = require('../config/database');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get user notifications with pagination
 */
const getNotifications = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { cursor, limit = 20, unreadOnly = false } = req.query;
    const take = Math.min(parseInt(limit), 50);

    // Build where clause
    const whereClause = { userId };

    if (unreadOnly === 'true') {
        whereClause.isRead = false;
    }

    if (cursor) {
        whereClause.id = { lt: cursor };
    }

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
        where: whereClause,
        take: take + 1,
        orderBy: { createdAt: 'desc' },
        include: {
            post: {
                select: {
                    id: true,
                    content: true,
                    imageUrl: true
                }
            },
            comment: {
                select: {
                    id: true,
                    content: true
                }
            },
            like: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            },
            follow: {
                include: {
                    follower: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    // Check if there are more notifications
    const hasMore = notifications.length > take;
    const notificationsToReturn = hasMore ? notifications.slice(0, -1) : notifications;

    // Get unread count
    const unreadCount = await prisma.notification.count({
        where: {
            userId,
            isRead: false
        }
    });

    // Format notifications
    const formattedNotifications = notificationsToReturn.map(notification => {
        const formatted = {
            id: notification.id,
            type: notification.type,
            message: notification.message,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
            post: notification.post,
            comment: notification.comment
        };

        // Add actor information based on notification type
        if (notification.type === 'LIKE' && notification.like) {
            formatted.actor = notification.like.user;
        } else if (notification.type === 'FOLLOW' && notification.follow) {
            formatted.actor = notification.follow.follower;
        }

        return formatted;
    });

    logger.debug(`Fetched ${formattedNotifications.length} notifications for user ${userId}`);

    res.status(200).json({
        status: 'success',
        data: {
            notifications: formattedNotifications,
            unreadCount,
            pagination: {
                hasMore,
                nextCursor: hasMore ? notificationsToReturn[notificationsToReturn.length - 1].id : null
            }
        }
    });
});

/**
 * Get unread notification count
 */
const getUnreadCount = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const unreadCount = await prisma.notification.count({
        where: {
            userId,
            isRead: false
        }
    });

    res.status(200).json({
        status: 'success',
        data: { unreadCount }
    });
});

/**
 * Mark notification as read
 */
const markAsRead = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
        throw new ApiError(403, 'You can only mark your own notifications as read');
    }

    // Update notification
    await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });

    // Get updated unread count
    const unreadCount = await prisma.notification.count({
        where: {
            userId,
            isRead: false
        }
    });

    logger.info(`Notification marked as read: ${notificationId}`);

    res.status(200).json({
        status: 'success',
        message: 'Notification marked as read',
        data: { unreadCount }
    });
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = catchAsync(async (req, res) => {
    const userId = req.user.id;

    // Update all unread notifications
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            isRead: false
        },
        data: { isRead: true }
    });

    logger.info(`Marked ${result.count} notifications as read for user ${userId}`);

    res.status(200).json({
        status: 'success',
        message: `${result.count} notifications marked as read`,
        data: {
            count: result.count,
            unreadCount: 0
        }
    });
});

/**
 * Delete a notification
 */
const deleteNotification = catchAsync(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
        throw new ApiError(403, 'You can only delete your own notifications');
    }

    // Delete notification
    await prisma.notification.delete({
        where: { id: notificationId }
    });

    logger.info(`Notification deleted: ${notificationId}`);

    res.status(200).json({
        status: 'success',
        message: 'Notification deleted'
    });
});

/**
 * Delete all read notifications
 */
const deleteAllRead = catchAsync(async (req, res) => {
    const userId = req.user.id;

    // Delete all read notifications
    const result = await prisma.notification.deleteMany({
        where: {
            userId,
            isRead: true
        }
    });

    logger.info(`Deleted ${result.count} read notifications for user ${userId}`);

    res.status(200).json({
        status: 'success',
        message: `${result.count} notifications deleted`,
        data: { count: result.count }
    });
});

/**
 * Get notification settings (placeholder for future implementation)
 */
const getNotificationSettings = catchAsync(async (req, res) => {
    const userId = req.user.id;

    // For now, return default settings
    // In production, this would be stored in database
    const settings = {
        likes: true,
        comments: true,
        follows: true,
        mentions: true,
        emailNotifications: false,
        pushNotifications: true
    };

    res.status(200).json({
        status: 'success',
        data: { settings }
    });
});

/**
 * Update notification settings (placeholder for future implementation)
 */
const updateNotificationSettings = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const settings = req.body;

    // In production, save to database
    logger.info(`Notification settings updated for user ${userId}`);

    res.status(200).json({
        status: 'success',
        message: 'Notification settings updated',
        data: { settings }
    });
});

module.exports = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    getNotificationSettings,
    updateNotificationSettings
};