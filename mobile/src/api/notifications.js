import apiClient from './client';

/**
 * Notifications API Service
 * 
 * Handles fetching and marking notifications as read.
 */

export const notificationsAPI = {
    /**
     * Get user notifications
     */
    getNotifications: () => {
        return apiClient.get('/notifications');
    },

    /**
     * Mark notification as read
     * @param {string} notificationId
     */
    markAsRead: (notificationId) => {
        return apiClient.patch(`/notifications/${notificationId}/read`);
    },

    /**
     * Mark all notifications as read
     */
    markAllAsRead: () => {
        return apiClient.patch('/notifications/read-all');
    },
};
