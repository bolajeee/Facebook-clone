import Constants from 'expo-constants';

/**
 * API Configuration
 * 
 * Centralized configuration for API endpoints.
 * In production, you'd use environment variables.
 * 
 * For local development:
 * - iOS Simulator: use localhost
 * - Android Emulator: use 10.0.2.2 (Android's special alias for host machine)
 * - Physical device: use your computer's local IP address
 */

const ENV = {
    dev: {
        apiUrl: 'http://localhost:5000/api',
        socketUrl: 'http://localhost:5000',
    },
    staging: {
        apiUrl: 'https://your-staging-api.com/api',
        socketUrl: 'https://your-staging-api.com',
    },
    prod: {
        apiUrl: 'https://your-production-api.com/api',
        socketUrl: 'https://your-production-api.com',
    },
};

const getEnvVars = () => {
    // You can switch this based on your needs
    return ENV.dev;
};

export default getEnvVars();
