import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

/**
 * Comment Preview Component
 * 
 * Displays a preview of 1-2 recent comments
 * with rounded message bubbles
 */
export default function CommentPreview({ postId, comments = [] }) {
    // For now, render empty - in a full implementation, 
    // you would fetch comments for this post
    if (!comments || comments.length === 0) {
        return null;
    }

    // Show only first comment
    const comment = comments[0];

    return (
        <View style={styles.container}>
            <View style={styles.commentRow}>
                {/* Avatar */}
                <Image
                    source={{
                        uri: comment.author?.avatar || comment.author?.avatarUrl ||
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(comment.author?.name || 'User')
                    }}
                    style={styles.avatar}
                />

                {/* Comment bubble */}
                <View style={styles.bubble}>
                    <Text style={styles.authorName} numberOfLines={1}>
                        {comment.author?.name || 'User'}
                    </Text>
                    <Text style={styles.commentText} numberOfLines={2}>
                        {comment.content}
                    </Text>
                </View>
            </View>

            {/* "View more comments" hint */}
            {comments.length > 1 && (
                <Text style={styles.viewMore}>
                    View {comments.length - 1} more {comments.length === 2 ? 'comment' : 'comments'}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    commentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#e4e6eb',
    },
    bubble: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    authorName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#050505',
        marginBottom: 2,
    },
    commentText: {
        fontSize: 13,
        color: '#050505',
        lineHeight: 18,
    },
    viewMore: {
        fontSize: 13,
        color: '#65676b',
        marginTop: 8,
        paddingLeft: 40,
    },
});
