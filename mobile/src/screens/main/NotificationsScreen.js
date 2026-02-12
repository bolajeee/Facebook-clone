import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Notifications Screen (Placeholder)
 * 
 * This will be fully implemented in Phase 10.
 * Will show real-time notifications with Socket.io.
 */

export default function NotificationsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>Coming in Phase 10</Text>
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
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
});
