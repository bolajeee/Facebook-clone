import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
import { initializeSocket, disconnectSocket } from '../services/socket';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';

/**
 * App Navigator
 * 
 * Root navigation component that:
 * - Checks if user is authenticated on app start
 * - Shows splash screen while checking
 * - Routes to Auth or Main stack based on auth state
 * - Initializes Socket.io connection when authenticated
 * 
 * This is the "authentication flow" pattern:
 * - If authenticated -> Show main app + connect socket
 * - If not authenticated -> Show login/register
 */

export default function AppNavigator() {
    const dispatch = useDispatch();
    const { isAuthenticated, isCheckingAuth, accessToken } = useSelector((state) => state.auth);

    useEffect(() => {
        // Check if user has stored credentials on app start
        dispatch(checkAuth());
    }, [dispatch]);

    // Initialize Socket.io when authenticated
    useEffect(() => {
        if (isAuthenticated && accessToken) {
            console.log('🔌 Initializing Socket.io connection...');
            initializeSocket(accessToken);

            // Cleanup on unmount or logout
            return () => {
                console.log('🔌 Disconnecting Socket.io...');
                disconnectSocket();
            };
        }
    }, [isAuthenticated, accessToken]);

    // Show splash screen while checking auth
    if (isCheckingAuth) {
        return <SplashScreen />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}
