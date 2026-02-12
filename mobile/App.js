import React from 'react';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import store from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Root App Component
 * 
 * This is the entry point of our React Native app.
 * It wraps the entire app with:
 * - Redux Provider for state management
 * - SafeAreaProvider for handling device notches/safe areas
 * - AppNavigator for navigation logic
 */
export default function App() {
    return (
        <Provider store={store}>
            <SafeAreaProvider>
                <StatusBar style="auto" />
                <AppNavigator />
            </SafeAreaProvider>
        </Provider>
    );
}
