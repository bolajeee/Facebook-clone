import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/api';

/**
 * Axios API Client
 * 
 * This is our centralized HTTP client with:
 * - Automatic token injection from AsyncStorage
 * - Token refresh logic when access token expires
 * - Request/response interceptors for error handling
 * 
 * Why this matters:
 * - DRY principle: Don't repeat auth headers in every request
 * - Automatic token refresh prevents user logout on token expiry
 * - Centralized error handling
 */

const apiClient = axios.create({
    baseURL: config.apiUrl,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Add access token to every request
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (!refreshToken) {
                    // No refresh token, user needs to login
                    throw new Error('No refresh token');
                }

                // Call refresh endpoint
                const response = await axios.post(`${config.apiUrl}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken } = response.data;

                // Save new access token
                await AsyncStorage.setItem('accessToken', accessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed, clear tokens and redirect to login
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
                // The navigation will be handled by Redux state change
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
