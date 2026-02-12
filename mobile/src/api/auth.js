import apiClient from './client';

/**
 * Auth API Service
 * 
 * All authentication-related API calls.
 * These functions return promises that resolve with the API response.
 */

export const authAPI = {
    /**
     * Register a new user
     * @param {Object} userData - { username, firstName, lastName, email, password }
     */
    register: (userData) => {
        return apiClient.post('/auth/register', userData);
    },

    /**
     * Login user
     * @param {Object} credentials - { identifier, password } - identifier can be email or username
     */
    login: (credentials) => {
        return apiClient.post('/auth/login', credentials);
    },

    /**
     * Refresh access token
     * @param {string} refreshToken
     */
    refreshToken: (refreshToken) => {
        return apiClient.post('/auth/refresh', { refreshToken });
    },

    /**
     * Logout user (optional: can call backend to invalidate refresh token)
     */
    logout: () => {
        return apiClient.post('/auth/logout');
    },
};
