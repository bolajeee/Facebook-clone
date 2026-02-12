import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Splash Screen
 * 
 * Shown while the app checks if user is authenticated.
 * This prevents flickering between auth and main screens.
 */

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>facebook</Text>
            <ActivityIndicator size="large" color="#1877f2" style={styles.loader} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    logo: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#1877f2',
        marginBottom: 20,
    },
    loader: {
        marginTop: 20,
    },
});
