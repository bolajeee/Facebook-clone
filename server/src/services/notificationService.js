/**
 * Notification Service
 * Centralized service for creating and managing notifications
 */

const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Create a notification for a like
 */
const createLikeNotification = async (io, postAuthorId, likerUser, postId, likeId) => {
    try {
        // Don't create notification if user likes their own post
        if (postAuthorId === likerUser.id) {
            return null;
        }

        const notification = await prisma.notification.create({
            data: {
                type: 'LIKE',
                message: `${likerUser.firstName} ${likerUser.lastName} liked your post`,
                userId: postAuthorId,
                postId,
                likeId
            },
            include: {
                post: {
                    select: {
                        id: true,
                        content: true,
                        imageUrl: true
                    }
                }
            }
        });

        // Add actor information
        const formattedNotification = {
            ...notification,
            actor: {
                id: likerUser.id,
                username: likerUser.username,
                firstName: likerUser.firstName,
                lastName: likerUser.lastName,
                avatar: likerUser.avatar
            }
        };

        // Emit real-time notification
        if (io) {
            io.to(`user:${postAuthorId}`).emit('notification:new', formattedNotification);

            // Also emit unread count update
            const unreadCount = await getUnreadCount(postAuthorId);
            io.to(`user:${postAuthorId}`).emit('notifications:unread_count', unreadCount);
        }

        logger.info(`Like notification created for user ${postAuthorId}`);
        return formattedNotification;
    } catch (error) {
        logger.error('Failed to create like notification:', error);
        return null;
    }
};

/**
 * Create a notification for a comment
 */
const createCommentNotification = async (io, postAuthorId, commenterUser, postId, commentId) => {
    try {
        // Don't create notification if user comments on their own post
        if (postAuthorId === commenterUser.id) {
            return null;
        }

        const notification = await prisma.notification.create({
            data: {
                type: 'COMMENT',
                message: `${commenterUser.firstName} ${commenterUser.lastName} commented on your post`,
                userId: postAuthorId,
                postId,
                commentId
            },
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
                }
            }
        });

        // Add actor information
        const formattedNotification = {
            ...notification,
            actor: {
                id: commenterUser.id,
                username: commenterUser.username,
                firstName: commenterUser.firstName,
                lastName: commenterUser.lastName,
                avatar: commenterUser.avatar
            }
        };

        // Emit real-time notification
        if (io) {
            io.to(`user:${postAuthorId}`).emit('notification:new', formattedNotification);

            // Also emit unread count update
            const unreadCount = await getUnreadCount(postAuthorId);
            io.to(`user:${postAuthorId}`).emit('notifications:unread_count', unreadCount);
        }

        logger.info(`Comment notification created for user ${postAuthorId}`);
        return formattedNotification;
    } catch (error) {
        logger.error('Failed to create comment notification:', error);
        return null;
    }
};

/**
 * Create a notification for a follow
 */
const createFollowNotification = async (io, followedUserId, followerUser, followId) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                type: 'FOLLOW',
                message: `${followerUser.firstName} ${followerUser.lastName} started following you`,
                userId: followedUserId,
                followId
            }
        });

        // Add actor information
        const formattedNotification = {
            ...notification,
            actor: {
                id: followerUser.id,
                username: followerUser.username,
                firstName: followerUser.firstName,
                lastName: followerUser.lastName,
                avatar: followerUser.avatar
            }
        };

        // Emit real-time notification
        if (io) {
            io.to(`user:${followedUserId}`).emit('notification:new', formattedNotification);

            // Also emit unread count update
            const unreadCount = await getUnreadCount(followedUserId);
            io.to(`user:${followedUserId}`).emit('notifications:unread_count', unreadCount);
        }

        logger.info(`Follow notification created for user ${followedUserId}`);
        return formattedNotification;
    } catch (error) {
        logger.error('Failed to create follow notification:', error);
        return null;
    }
};

/**
 * Create a notification for a mention (placeholder for future implementation)
 */
const createMentionNotification = async (io, mentionedUserId, mentionerUser, postId, commentId = null) => {
    try {
        // Don't create notification if user mentions themselves
        if (mentionedUserId === mentionerUser.id) {
            return null;
        }

        const notification = await prisma.notification.create({
            data: {
                type: 'MENTION',
                message: `${mentionerUser.firstName} ${mentionerUser.lastName} mentioned you`,
                userId: mentionedUserId,
                postId,
                commentId
            },
            include: {
                post: {
                    select: {
                        id: true,
                        content: true,
                        imageUrl: true
                    }
                },
                comment: commentId ? {
                    select: {
                        id: true,
                        content: true
                    }
                } : undefined
            }
        });

        // Add actor information
        const formattedNotification = {
            ...notification,
            actor: {
                id: mentionerUser.id,
                username: mentionerUser.username,
                firstName: mentionerUser.firstName,
                lastName: mentionerUser.lastName,
                avatar: mentionerUser.avatar
            }
        };

        // Emit real-time notification
        if (io) {
            io.to(`user:${mentionedUserId}`).emit('notification:new', formattedNotification);

            // Also emit unread count update
            const unreadCount = await getUnreadCount(mentionedUserId);
            io.to(`user:${mentionedUserId}`).emit('notifications:unread_count', unreadCount);
        }

        logger.info(`Mention notification created for user ${mentionedUserId}`);
        return formattedNotification;
    } catch (error) {
        logger.error('Failed to create mention notification:', error);
        return null;
    }
};

/**
 * Get unread notification count for a user
 */
const getUnreadCount = async (userId) => {
    try {
        const count = await prisma.notification.count({
            where: {
                userId,
                isRead: false
            }
        });
        return count;
    } catch (error) {
        logger.error('Failed to get unread count:', error);
        return 0;
    }
};

/**
 * Delete notification when source is deleted
 */
const deleteNotificationsBySource = async (sourceType, sourceId) => {
    try {
        const whereClause = {};

        switch (sourceType) {
            case 'post':
                whereClause.postId = sourceId;
                break;
            case 'comment':
                whereClause.commentId = sourceId;
                break;
            case 'like':
                whereClause.likeId = sourceId;
                break;
            case 'follow':
                whereClause.followId = sourceId;
                break;
            default:
                return;
        }

        const result = await prisma.notification.deleteMany({
            where: whereClause
        });

        logger.info(`Deleted ${result.count} notifications for ${sourceType} ${sourceId}`);
    } catch (error) {
        logger.error('Failed to delete notifications:', error);
    }
};

/**
 * Batch create notifications (for multiple users)
 */
const batchCreateNotifications = async (io, notifications) => {
    try {
        const created = await prisma.notification.createMany({
            data: notifications
        });

        // Emit to all affected users
        for (const notification of notifications) {
            if (io) {
                io.to(`user:${notification.userId}`).emit('notification:new', notification);

                const unreadCount = await getUnreadCount(notification.userId);
                io.to(`user:${notification.userId}`).emit('notifications:unread_count', unreadCount);
            }
        }

        logger.info(`Batch created ${created.count} notifications`);
        return created;
    } catch (error) {
        logger.error('Failed to batch create notifications:', error);
        return null;
    }
};

/**
 * Clean up old read notifications (run periodically)
 */
const cleanupOldNotifications = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await prisma.notification.deleteMany({
            where: {
                isRead: true,
                createdAt: {
                    lt: cutoffDate
                }
            }
        });

        logger.info(`Cleaned up ${result.count} old notifications`);
        return result.count;
    } catch (error) {
        logger.error('Failed to cleanup old notifications:', error);
        return 0;
    }
};

module.exports = {
    createLikeNotification,
    createCommentNotification,
    createFollowNotification,
    createMentionNotification,
    getUnreadCount,
    deleteNotificationsBySource,
    batchCreateNotifications,
    cleanupOldNotifications
};