import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Post Actions Component
 * 
 * Displays action buttons for posts:
 * - Like (with heart icon toggle)
 * - Comment
 * - Share
 * 
 * Touch-friendly with 44px minimum tap targets
 */
export default function PostActions({ post, onLike, onComment, onShare }) {
    return (
        <View style={styles.container}>
            {/* Like button */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onLike}
                activeOpacity={0.7}
            >
                <Ionicons
                    name={post.isLikedByUser ? 'heart' : 'heart-outline'}
                    size={20}
                    color={post.isLikedByUser ? '#f02849' : '#65676b'}
                />
                <Text style={[
                    styles.actionText,
                    post.isLikedByUser && styles.actionTextActive
                ]}>
                    Like
                </Text>
            </TouchableOpacity>

            {/* Comment button */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onComment}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#65676b"
                />
                <Text style={styles.actionText}>Comment</Text>
            </TouchableOpacity>

            {/* Share button */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={onShare}
                activeOpacity={0.7}
            >
                <Ionicons
                    name="share-social-outline"
                    size={20}
                    color="#65676b"
                />
                <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        minHeight: 44,
    },
    actionText: {
        fontSize: 14,
        color: '#65676b',
        fontWeight: '600',
    },
    actionTextActive: {
        color: '#f02849',
    },
});
