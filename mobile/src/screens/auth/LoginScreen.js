import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../../store/slices/authSlice';
import { testConnection, testHealth } from '../../utils/testConnection';

/**
 * Login Screen
 * 
 * Allows users to login with email and password.
 * Features:
 * - Form validation
 * - Loading state
 * - Error handling
 * - Navigation to Register screen
 */

export default function LoginScreen({ navigation }) {
    const dispatch = useDispatch();
    const { isLoading, error } = useSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleTestConnection = async () => {
        Alert.alert('Testing Connection', 'Checking backend connection...');

        const healthResult = await testHealth();
        const testResult = await testConnection();

        if (healthResult.success && testResult.success) {
            Alert.alert(
                'Connection Successful! ✅',
                `Backend is running and healthy.\n\nServer: ${testResult.data.server}\nDatabase: ${healthResult.data.services.database}\nRedis: ${healthResult.data.services.redis}`,
                [{ text: 'OK' }]
            );
        } else {
            Alert.alert(
                'Connection Failed ❌',
                `Cannot connect to backend server.\n\nError: ${testResult.error || healthResult.error}\n\nMake sure:\n1. Backend server is running\n2. API URL is correct in config\n3. For Android emulator, use 10.0.2.2\n4. For physical device, use your IP`,
                [{ text: 'OK' }]
            );
        }
    };

    const handleLogin = async () => {
        // Basic validation
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!email.includes('@')) {
            Alert.alert('Error', 'Please enter a valid email');
            return;
        }

        // Dispatch login action
        const result = await dispatch(login({ email, password }));

        if (login.rejected.match(result)) {
            Alert.alert('Login Failed', result.payload);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Logo */}
                <Text style={styles.logo}>facebook</Text>
                <Text style={styles.subtitle}>Connect with friends and the world</Text>

                {/* Email Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                />

                {/* Password Input */}
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading}
                />

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Log In</Text>
                    )}
                </TouchableOpacity>

                {/* Register Link */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    disabled={isLoading}
                >
                    <Text style={styles.link}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>

                {/* Test Connection Button (for debugging) */}
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={handleTestConnection}
                    disabled={isLoading}
                >
                    <Text style={styles.testButtonText}>🔧 Test Server Connection</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1877f2',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    input: {
        backgroundColor: '#f0f2f5',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#1877f2',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    link: {
        color: '#1877f2',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
    },
    testButton: {
        marginTop: 30,
        padding: 12,
        borderWidth: 1,
        borderColor: '#1877f2',
        borderRadius: 8,
        alignItems: 'center',
    },
    testButtonText: {
        color: '#1877f2',
        fontSize: 14,
    },
});
