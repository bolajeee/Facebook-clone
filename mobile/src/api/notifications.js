import apiClient from './client';

/**
 * Notifications API Service
 * 
 * Handles fetching and marking notifications as read.
 */

export const notificationsAPI = {
    /**
     * Get user notifications with pagination
     * @param {string} cursor - Pagination cursor
     * @param {number} limit - Number of notifications to fetch
     * @param {boolean} unreadOnly - Fetch only unread notifications
     */
    getNotifications: (cursor = null, limit = 20, unreadOnly = false) => {
        const params = { limit, unreadOnly };
        if (cursor) params.cursor = cursor;
        return apiClient.get('/notifications', { params });
    },

    /**
     * Get unread notification count
     */
    getUnreadCount: () => {
        return apiClient.get('/notifications/unread-count');
    },

    /**
     * Mark notification as read
     * @param {string} notificationId
     */
    markAsRead: (notificationId) => {
        return apiClient.put(`/notifications/${notificationId}/read`);
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: () => {
        return apiClient.put('/notifications/read-all');
    },

    /**
     * Delete a notification
     * @param {string} notificationId
     */
    deleteNotification: (notificationId) => {
        return apiClient.delete(`/notifications/${notificationId}`);
    },

    /**
     * Delete all read notifications
     */
    deleteAllRead: () => {
        return apiClient.delete('/notifications/read');
    },

    /**
     * Get notification settings
     */
    getSettings: () => {
        return apiClient.get('/notifications/settings');
    },

    /**
     * Update notification settings
     * @param {Object} settings
     */
    updateSettings: (settings) => {
        return apiClient.put('/notifications/settings', settings);
    },
};
