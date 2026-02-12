import axios from 'axios';
import config from '../config/api';

/**
 * Test Connection Utility
 * 
 * Use this to verify the mobile app can connect to the backend.
 * Call this function from any screen to test connectivity.
 */

export const testConnection = async () => {
    try {
        console.log('🔍 Testing connection to:', config.apiUrl);

        const response = await axios.get(`${config.apiUrl}/test`, {
            timeout: 5000,
        });

        console.log('✅ Connection successful!');
        console.log('Response:', response.data);

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('❌ Connection failed:', error.message);

        if (error.code === 'ECONNREFUSED') {
            console.error('→ Backend server is not running');
            console.error('→ Start the server with: cd server && npm run dev');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('→ Connection timeout');
            console.error('→ Check your API URL in src/config/api.js');
        } else if (error.message.includes('Network Error')) {
            console.error('→ Network error');
            console.error('→ For Android emulator, use 10.0.2.2 instead of localhost');
            console.error('→ For physical device, use your computer\'s IP address');
        }

        return {
            success: false,
            error: error.message,
            code: error.code,
        };
    }
};

/**
 * Test Health Endpoint
 * 
 * Tests the /health endpoint to verify backend services
 */
export const testHealth = async () => {
    try {
        // Remove /api from the URL for health check
        const baseUrl = config.apiUrl.replace('/api', '');
        console.log('🔍 Testing health endpoint:', `${baseUrl}/health`);

        const response = await axios.get(`${baseUrl}/health`, {
            timeout: 5000,
        });

        console.log('✅ Health check successful!');
        console.log('Services:', response.data.services);

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error('❌ Health check failed:', error.message);

        return {
            success: false,
            error: error.message,
        };
    }
};
