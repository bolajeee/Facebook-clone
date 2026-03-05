import { io } from 'socket.io-client';
import config from '../config/api';
import store from '../store';
import { addNotification } from '../store/slices/notificationsSlice';

/**
 * Socket.io Service
 * 
 * Manages real-time WebSocket connection for:
 * - Real-time notifications
 * - Online status
 * - Live comments/likes
 */

let socket = null;

/**
 * Initialize Socket.io connection
 * @param {string} accessToken - JWT access token for authentication
 */
export const initializeSocket = (accessToken) => {
    if (socket?.connected) {
        console.log('Socket already connected');
        return socket;
    }

    // Use socketUrl from config, fallback to apiUrl without /api
    const baseUrl = config.socketUrl || config.apiUrl?.replace('/api', '') || 'http://localhost:5000';

    socket = io(baseUrl, {
        auth: {
            token: accessToken,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
    });

    // Connection events
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    // Notification events
    socket.on('notification:new', (notification) => {
        console.log('📬 New notification received:', notification);
        store.dispatch(addNotification(notification));
    });

    // Online status events
    socket.on('online:count', (count) => {
        console.log('👥 Online users:', count);
    });

    socket.on('user:online', ({ userId, username }) => {
        console.log(`✅ User ${username} is online`);
    });

    socket.on('user:offline', ({ userId, username }) => {
        console.log(`❌ User ${username} is offline`);
    });

    return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected');
    }
};

/**
 * Get current socket instance
 */
export const getSocket = () => {
    return socket;
};

/**
 * Join a post room for real-time updates
 */
export const joinPostRoom = (postId) => {
    if (socket?.connected) {
        socket.emit('post:join', postId);
    }
};

/**
 * Leave a post room
 */
export const leavePostRoom = (postId) => {
    if (socket?.connected) {
        socket.emit('post:leave', postId);
    }
};

/**
 * Emit typing indicator for comments
 */
export const emitTyping = (postId, isTyping) => {
    if (socket?.connected) {
        socket.emit('comment:typing', { postId, isTyping });
    }
};

/**
 * Mark notifications as read via socket
 */
export const markNotificationsRead = (notificationIds) => {
    if (socket?.connected) {
        socket.emit('notifications:read', notificationIds);
    }
};

/**
 * Listen for unread count updates
 */
export const onUnreadCountUpdate = (callback) => {
    if (socket) {
        socket.on('notifications:unread_count', callback);
    }
};

/**
 * Remove unread count listener
 */
export const offUnreadCountUpdate = () => {
    if (socket) {
        socket.off('notifications:unread_count');
    }
};
