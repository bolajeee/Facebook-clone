import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from '../store/slices/authSlice';
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
 * 
 * This is the "authentication flow" pattern:
 * - If authenticated -> Show main app
 * - If not authenticated -> Show login/register
 */

export default function AppNavigator() {
    const dispatch = useDispatch();
    const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

    useEffect(() => {
        // Check if user has stored credentials on app start
        dispatch(checkAuth());
    }, [dispatch]);

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
