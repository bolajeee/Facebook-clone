/**
 * Socket.io Event Handlers
 */

const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

// Store active user connections
const activeUsers = new Map();

/**
 * Authenticate socket connection using JWT token
 */
const authenticateSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication token required'));
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
            }
        });

        if (!user) {
            return next(new Error('User not found'));
        }

        // Attach user to socket
        socket.user = user;
        next();

    } catch (error) {
        logger.error('Socket authentication failed:', error);
        next(new Error('Invalid authentication token'));
    }
};

/**
 * Setup all Socket.io event handlers
 */
const setupSocketHandlers = (io) => {
    // Authentication middleware
    io.use(authenticateSocket);

    io.on('connection', (socket) => {
        const user = socket.user;
        logger.info(`User ${user.username} connected via socket`);

        // Store user connection
        activeUsers.set(user.id, {
            socketId: socket.id,
            user: user,
            connectedAt: new Date()
        });

        // Join user to their personal room for notifications
        socket.join(`user:${user.id}`);

        // Emit online status to user's followers
        socket.broadcast.emit('user:online', {
            userId: user.id,
            username: user.username
        });

        // Send current online users count
        socket.emit('online:count', activeUsers.size);

        // Handle user joining a post room for real-time comments
        socket.on('post:join', (postId) => {
            socket.join(`post:${postId}`);
            logger.debug(`User ${user.username} joined post room: ${postId}`);
        });

        // Handle user leaving a post room
        socket.on('post:leave', (postId) => {
            socket.leave(`post:${postId}`);
            logger.debug(`User ${user.username} left post room: ${postId}`);
        });

        // Handle real-time typing indicators for comments
        socket.on('comment:typing', ({ postId, isTyping }) => {
            socket.to(`post:${postId}`).emit('comment:typing', {
                userId: user.id,
                username: user.username,
                isTyping
            });
        });

        // Handle marking notifications as read
        socket.on('notifications:read', async (notificationIds) => {
            try {
                await prisma.notification.updateMany({
                    where: {
                        id: { in: notificationIds },
                        userId: user.id
                    },
                    data: { isRead: true }
                });

                // Emit updated unread count
                const unreadCount = await prisma.notification.count({
                    where: {
                        userId: user.id,
                        isRead: false
                    }
                });

                socket.emit('notifications:unread_count', unreadCount);

            } catch (error) {
                logger.error('Failed to mark notifications as read:', error);
                socket.emit('error', { message: 'Failed to update notifications' });
            }
        });

        // Handle user disconnect
        socket.on('disconnect', (reason) => {
            logger.info(`User ${user.username} disconnected: ${reason}`);

            // Remove user from active users
            activeUsers.delete(user.id);

            // Emit offline status to user's followers
            socket.broadcast.emit('user:offline', {
                userId: user.id,
                username: user.username
            });

            // Update online users count
            io.emit('online:count', activeUsers.size);
        });

        // Handle connection errors
        socket.on('error', (error) => {
            logger.error(`Socket error for user ${user.username}:`, error);
        });
    });

    // Log total connections
    io.engine.on('connection_error', (err) => {
        logger.error('Socket.io connection error:', err);
    });
};

/**
 * Emit notification to specific user
 */
const emitNotificationToUser = (io, userId, notification) => {
    io.to(`user:${userId}`).emit('notification:new', notification);
    logger.debug(`Notification sent to user ${userId}`);
};

/**
 * Emit new comment to post room
 */
const emitCommentToPost = (io, postId, comment) => {
    io.to(`post:${postId}`).emit('comment:new', comment);
    logger.debug(`New comment emitted to post ${postId}`);
};

/**
 * Emit new like to post room
 */
const emitLikeToPost = (io, postId, like) => {
    io.to(`post:${postId}`).emit('like:new', like);
    logger.debug(`New like emitted to post ${postId}`);
};

/**
 * Get online users count
 */
const getOnlineUsersCount = () => {
    return activeUsers.size;
};

/**
 * Check if user is online
 */
const isUserOnline = (userId) => {
    return activeUsers.has(userId);
};

/**
 * Get all online users (for admin purposes)
 */
const getOnlineUsers = () => {
    return Array.from(activeUsers.values()).map(connection => ({
        userId: connection.user.id,
        username: connection.user.username,
        connectedAt: connection.connectedAt
    }));
};

module.exports = {
    setupSocketHandlers,
    emitNotificationToUser,
    emitCommentToPost,
    emitLikeToPost,
    getOnlineUsersCount,
    isUserOnline,
    getOnlineUsers
};