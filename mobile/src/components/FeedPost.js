import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { likePost, unlikePost, optimisticLike, optimisticUnlike } from '../store/slices/postsSlice';
import PostActions from './PostActions';
import CommentPreview from './CommentPreview';

/**
 * Feed Post Component (Modernized)
 * 
 * Renders a single post in the feed with:
 * - Rounded card design with soft shadows
 * - Improved spacing and typography
 * - Engagement stats and comment preview
 * - Action buttons (Like, Comment, Share)
 * - Optimistic UI updates for likes
 * - Navigation to comments screen
 */

export default function FeedPost({ post }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();

    const handleLike = () => {
        if (post.isLikedByUser) {
            dispatch(optimisticUnlike({ postId: post.id, userId: post.userId }));
            dispatch(unlikePost(post.id));
        } else {
            dispatch(optimisticLike({ postId: post.id, userId: post.userId }));
            dispatch(likePost(post.id));
        }
    };

    const handleCommentPress = () => {
        navigation.navigate('Comments', {
            postId: post.id,
            postAuthor: post.author,
        });
    };

    return (
        <View style={styles.container}>
            {/* Post Card */}
            <View style={styles.card}>
                {/* Header: User info and menu */}
                <View style={styles.header}>
                    <View style={styles.userSection}>
                        <Image
                            source={{
                                uri: post.author?.avatar || post.author?.avatarUrl ||
                                    'https://ui-avatars.com/api/?name=' +
                                    encodeURIComponent(post.author?.username || post.author?.name || 'User')
                            }}
                            style={styles.avatar}
                        />
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>
                                {post.author?.firstName && post.author?.lastName
                                    ? `${post.author.firstName} ${post.author.lastName}`
                                    : post.author?.name || post.author?.username || 'Unknown User'}
                            </Text>
                            <Text style={styles.timestamp}>
                                {formatTimestamp(post.createdAt)}
                            </Text>
                        </View>
                    </View>

                    {/* Menu button */}
                    <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
                        <Ionicons name="ellipsis-horizontal" size={20} color="#65676b" />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                {post.content && (
                    <Text style={styles.content}>{post.content}</Text>
                )}

                {/* Image */}
                {post.imageUrl && post.imageUrl !== 'null' && (
                    <Image
                        source={{ uri: post.imageUrl }}
                        style={styles.postImage}
                        resizeMode="cover"
                        onError={(e) => {
                            console.error('Image load error for post', post.id, ':', e.nativeEvent.error);
                        }}
                    />
                )}

                {/* Engagement stats */}
                {(post.likesCount > 0 || post.commentsCount > 0) && (
                    <View style={styles.statsContainer}>
                        {post.likesCount > 0 && (
                            <Text style={styles.statsText}>
                                <Ionicons name="heart" size={14} color="#f02849" />
                                {' '}{post.likesCount} {post.likesCount === 1 ? 'like' : 'likes'}
                            </Text>
                        )}
                        {post.commentsCount > 0 && (
                            <Text style={styles.statsText}>
                                {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                            </Text>
                        )}
                    </View>
                )}

                {/* Divider */}
                <View style={styles.divider} />

                {/* Action buttons */}
                <PostActions 
                    post={post}
                    onLike={handleLike}
                    onComment={handleCommentPress}
                />

                {/* Comment preview */}
                {post.commentsCount > 0 && (
                    <>
                        <View style={styles.divider} />
                        <CommentPreview postId={post.id} />
                    </>
                )}
            </View>
        </View>
    );
}

/**
 * Format timestamp to relative time
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
        backgroundColor: '#f0f2f5',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    userSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e4e6eb',
    },
    userInfo: {
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
    menuButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        fontSize: 15,
        color: '#050505',
        lineHeight: 22,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    postImage: {
        width: '100%',
        height: 320,
        backgroundColor: '#e4e6eb',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 16,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    statsText: {
        fontSize: 13,
        color: '#65676b',
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: '#e4e6eb',
    },
});
