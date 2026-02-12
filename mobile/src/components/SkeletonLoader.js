import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

/**
 * SkeletonLoader Component
 * 
 * Animated loading placeholder that mimics the PostCard layout.
 * Shows while feed is loading for better UX.
 */

export default function SkeletonLoader() {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Pulse animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Header skeleton */}
            <View style={styles.header}>
                <Animated.View style={[styles.avatar, { opacity }]} />
                <View style={styles.userInfo}>
                    <Animated.View style={[styles.nameLine, { opacity }]} />
                    <Animated.View style={[styles.timeLine, { opacity }]} />
                </View>
            </View>

            {/* Content skeleton */}
            <Animated.View style={[styles.contentLine, { opacity }]} />
            <Animated.View style={[styles.contentLine, styles.contentLineShort, { opacity }]} />

            {/* Image skeleton */}
            <Animated.View style={[styles.imagePlaceholder, { opacity }]} />

            {/* Actions skeleton */}
            <View style={styles.actions}>
                <Animated.View style={[styles.actionButton, { opacity }]} />
                <Animated.View style={[styles.actionButton, { opacity }]} />
                <Animated.View style={[styles.actionButton, { opacity }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginBottom: 8,
        paddingVertical: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e4e6eb',
    },
    userInfo: {
        marginLeft: 10,
        flex: 1,
    },
    nameLine: {
        width: 120,
        height: 14,
        backgroundColor: '#e4e6eb',
        borderRadius: 4,
        marginBottom: 6,
    },
    timeLine: {
        width: 80,
        height: 12,
        backgroundColor: '#e4e6eb',
        borderRadius: 4,
    },
    contentLine: {
        height: 14,
        backgroundColor: '#e4e6eb',
        borderRadius: 4,
        marginHorizontal: 12,
        marginBottom: 8,
    },
    contentLineShort: {
        width: '60%',
    },
    imagePlaceholder: {
        width: '100%',
        height: 300,
        backgroundColor: '#e4e6eb',
        marginBottom: 12,
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingTop: 8,
    },
    actionButton: {
        flex: 1,
        height: 30,
        backgroundColor: '#e4e6eb',
        borderRadius: 4,
        marginHorizontal: 4,
    },
});
