import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

/**
 * Auth Navigator
 * 
 * Stack navigator for authentication screens.
 * Users can navigate between Login and Register.
 * 
 * Stack navigation is used here because:
 * - Linear flow (Login -> Register or vice versa)
 * - Back button makes sense
 * - No need for tabs
 */

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, 
            }}
        >
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
}
