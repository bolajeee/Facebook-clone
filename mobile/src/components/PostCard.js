import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { likePost, unlikePost, optimisticLike, optimisticUnlike } from '../store/slices/postsSlice';

/**
 * PostCard Component
 * 
 * Renders a single post in the feed with:
 * - User avatar and name
 * - Post content and image
 * - Like, comment, share buttons
 * - Optimistic UI updates for likes
 */

export default function PostCard({ post }) {
    const dispatch = useDispatch();

    const handleLike = () => {
        if (post.isLikedByUser) {
            // Optimistic update first
            dispatch(optimisticUnlike({ postId: post.id, userId: post.userId }));
            // Then API call
            dispatch(unlikePost(post.id));
        } else {
            // Optimistic update first
            dispatch(optimisticLike({ postId: post.id, userId: post.userId }));
            // Then API call
            dispatch(likePost(post.id));
        }
    };

    return (
        <View style={styles.container}>
            {/* Header: User info */}
            <View style={styles.header}>
                <Image
                    source={{ uri: post.author?.avatarUrl || 'https://via.placeholder.com/40' }}
                    style={styles.avatar}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{post.author?.name || 'Unknown User'}</Text>
                    <Text style={styles.timestamp}>
                        {formatTimestamp(post.createdAt)}
                    </Text>
                </View>
            </View>

            {/* Content */}
            {post.content && (
                <Text style={styles.content}>{post.content}</Text>
            )}

            {/* Image */}
            {post.imageUrl && (
                <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.postImage}
                    resizeMode="cover"
                />
            )}

            {/* Stats: likes and comments count */}
            <View style={styles.stats}>
                <Text style={styles.statsText}>
                    {post.likesCount || 0} {post.likesCount === 1 ? 'like' : 'likes'}
                </Text>
                <Text style={styles.statsText}>
                    {post.commentsCount || 0} {post.commentsCount === 1 ? 'comment' : 'comments'}
                </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleLike}
                    activeOpacity={0.7}
                >
                    <Text style={[
                        styles.actionText,
                        post.isLikedByUser && styles.actionTextActive
                    ]}>
                        👍 Like
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <Text style={styles.actionText}>💬 Comment</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                    <Text style={styles.actionText}>↗️ Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

/**
 * Format timestamp to relative time
 * e.g., "2 hours ago", "3 days ago"
 */
function formatTimestamp(timestamp) {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return postDate.toLocaleDateString();
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
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#050505',
    },
    timestamp: {
        fontSize: 13,
        color: '#65676b',
        marginTop: 2,
    },
    content: {
        fontSize: 15,
        color: '#050505',
        lineHeight: 20,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 300,
        backgroundColor: '#e4e6eb',
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    statsText: {
        fontSize: 13,
        color: '#65676b',
    },
    actions: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingTop: 4,
    },
    actionButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 14,
        color: '#65676b',
        fontWeight: '600',
    },
    actionTextActive: {
        color: '#1877f2',
    },
});
