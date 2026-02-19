import apiClient from './client';

/**
 * Users API Service
 * 
 * All user-related API calls including:
 * - User profiles
 * - Follow/unfollow
 * - Followers/following lists
 * - User posts
 */

export const usersAPI = {
    /**
     * Get user profile by ID
     * @param {string} userId
     */
    getUserProfile: (userId) => {
        return apiClient.get(`/users/profile/${userId}`);
    },

    /**
     * Update current user's profile
     * @param {Object} profileData - { firstName, lastName, bio, avatar }
     */
    updateProfile: (profileData) => {
        return apiClient.put('/users/profile', profileData);
    },

    /**
     * Follow a user
     * @param {string} userId
     */
    followUser: (userId) => {
        return apiClient.post(`/users/follow/${userId}`);
    },

    /**
     * Unfollow a user
     * @param {string} userId
     */
    unfollowUser: (userId) => {
        return apiClient.delete(`/users/follow/${userId}`);
    },

    /**
     * Get user's followers
     * @param {string} userId
     * @param {string} cursor - Pagination cursor
     * @param {number} limit - Number of followers to fetch
     */
    getFollowers: (userId, cursor = null, limit = 20) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/users/${userId}/followers`, { params });
    },

    /**
     * Get user's following
     * @param {string} userId
     * @param {string} cursor - Pagination cursor
     * @param {number} limit - Number of following to fetch
     */
    getFollowing: (userId, cursor = null, limit = 20) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/users/${userId}/following`, { params });
    },

    /**
     * Get user's posts
     * @param {string} userId
     * @param {string} cursor - Pagination cursor
     * @param {number} limit - Number of posts to fetch
     */
    getUserPosts: (userId, cursor = null, limit = 10) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/users/${userId}/posts`, { params });
    },
};
