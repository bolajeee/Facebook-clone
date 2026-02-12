import apiClient from './client';

/**
 * Posts API Service
 * 
 * All post-related API calls including:
 * - Fetching feed with cursor pagination
 * - Creating posts
 * - Liking/unliking posts
 * - Comments
 */

export const postsAPI = {
    /**
     * Get user feed with cursor pagination
     * @param {string} cursor - Last post ID from previous page (optional)
     * @param {number} limit - Number of posts to fetch
     */
    getFeed: (cursor = null, limit = 10) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get('/posts/feed', { params });
    },

    /**
     * Create a new post
     * @param {Object} postData - { content, imageUrl }
     */
    createPost: (postData) => {
        return apiClient.post('/posts', postData);
    },

    /**
     * Like a post
     * @param {string} postId
     */
    likePost: (postId) => {
        return apiClient.post(`/posts/${postId}/like`);
    },

    /**
     * Unlike a post
     * @param {string} postId
     */
    unlikePost: (postId) => {
        return apiClient.delete(`/posts/${postId}/like`);
    },

    /**
     * Get comments for a post
     * @param {string} postId
     */
    getComments: (postId) => {
        return apiClient.get(`/posts/${postId}/comments`);
    },

    /**
     * Add a comment to a post
     * @param {string} postId
     * @param {string} content
     */
    addComment: (postId, content) => {
        return apiClient.post(`/posts/${postId}/comments`, { content });
    },
};
