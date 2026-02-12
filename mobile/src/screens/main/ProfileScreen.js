import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

/**
 * Profile Screen (Placeholder)
 * 
 * This will be fully implemented in Phase 9.
 * Will show user profile, posts, and follow system.
 */

export default function ProfileScreen() {
    const { user } = useSelector((state) => state.auth);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <Text style={styles.subtitle}>Profile Screen - Coming in Phase 9</Text>
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
        marginBottom: 5,
    },
    email: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#999',
    },
});
