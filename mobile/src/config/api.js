import Constants from 'expo-constants';
import { Platform } from 'react-native';

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

const getLocalHost = () => {
    if (Platform.OS === 'android') {
        return '10.0.2.2';
    }

    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
        return hostUri.split(':')[0];
    }

    return 'localhost';
};

const ENV = {
    dev: (() => {
        const host = getLocalHost();
        return {
            apiUrl: `http://${host}:5000/api`,
            socketUrl: `http://${host}:5000`,
        };
    })(),
    staging: {
        apiUrl: 'https://your-staging-api.com/api',
        socketUrl: 'https://your-staging-api.com',
    },
    prod: {
        apiUrl: 'https://your-production-api.com/api',
        socketUrl: 'https://your-production-api.com',
    },
};

const getEnvVars = () => ENV.dev;

export default getEnvVars();
