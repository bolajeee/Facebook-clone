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
     * @param {string} parentCommentId - Optional, for replies to comments
     */
    addComment: (postId, content, parentCommentId = null) => {
        const data = { content };
        if (parentCommentId) data.parentCommentId = parentCommentId;
        return apiClient.post(`/posts/${postId}/comments`, data);
    },

    /**
     * Get a single post
     * @param {string} postId
     */
    getPost: (postId) => {
        return apiClient.get(`/posts/${postId}`);
    },

    /**
     * Get posts by a specific user
     * @param {string} userId
     * @param {string} cursor - Optional cursor for pagination
     * @param {number} limit - Number of posts to fetch
     */
    getUserPosts: (userId, cursor = null, limit = 10) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/posts/user/${userId}`, { params });
    },

    /**
     * Update a post
     * @param {string} postId
     * @param {Object} postData - { content, imageUrl }
     */
    updatePost: (postId, postData) => {
        return apiClient.put(`/posts/${postId}`, postData);
    },

    /**
     * Delete a post
     * @param {string} postId
     */
    deletePost: (postId) => {
        return apiClient.delete(`/posts/${postId}`);
    },

    /**
     * Get post likes
     * @param {string} postId
     * @param {string} cursor - Optional cursor for pagination
     * @param {number} limit - Number of likes to fetch
     */
    getPostLikes: (postId, cursor = null, limit = 10) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/posts/${postId}/likes`, { params });
    },

    /**
     * Get post comments with pagination
     * @param {string} postId
     * @param {string} cursor - Optional cursor for pagination
     * @param {number} limit - Number of comments to fetch
     */
    getPostComments: (postId, cursor = null, limit = 10) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/posts/${postId}/comments`, { params });
    },

    /**
     * Delete a comment
     * @param {string} commentId
     */
    deleteComment: (commentId) => {
        return apiClient.delete(`/posts/comments/${commentId}`);
    },

    /**
     * Update a comment
     * @param {string} commentId
     * @param {Object} commentData - { content }
     */
    updateComment: (commentId, commentData) => {
        return apiClient.put(`/posts/comments/${commentId}`, commentData);
    },

    /**
     * Get replies to a comment
     * @param {string} commentId
     * @param {string} cursor - Optional cursor for pagination
     * @param {number} limit - Number of replies to fetch
     */
    getCommentReplies: (commentId, cursor = null, limit = 10) => {
        const params = { limit };
        if (cursor) params.cursor = cursor;
        return apiClient.get(`/posts/comments/${commentId}/replies`, { params });
    },
};
