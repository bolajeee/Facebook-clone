import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { postsAPI } from '../../api/posts';

/**
 * Comments Screen
 * 
 * Shows comments for a post with:
 * - List of comments
 * - Add new comment
 * - Delete own comments
 * - Keyboard handling
 */

export default function CommentsScreen({ route, navigation }) {
    const { postId, postAuthor } = route.params;
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            setIsLoading(true);
            setError(null);
            console.log('Fetching comments for post:', postId);
            const response = await postsAPI.getPostComments(postId);
            console.log('Comments response:', response.data);
            const commentsData = response.data?.data?.comments || response.data?.comments || [];
            setComments(commentsData);
        } catch (err) {
            console.error('Fetch comments error:', err);
            console.error('Error response:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to load comments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            setIsSubmitting(true);
            console.log('Adding comment to post:', postId);
            const response = await postsAPI.addComment(postId, newComment.trim());
            console.log('Add comment response:', response.data);
            const comment = response.data?.data?.comment || response.data?.comment;

            if (comment) {
                // Add new comment to list
                setComments([comment, ...comments]);
                setNewComment('');
                inputRef.current?.blur();
            }
        } catch (err) {
            console.error('Add comment error:', err);
            console.error('Error response:', err.response?.data);
            alert(err.response?.data?.message || 'Failed to add comment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await postsAPI.deleteComment(commentId);
            setComments(comments.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Delete comment error:', err);
            alert('Failed to delete comment');
        }
    };

    const renderComment = ({ item }) => {
        const authorName = item.author?.firstName && item.author?.lastName
            ? `${item.author.firstName} ${item.author.lastName}`
            : item.author?.username || 'Unknown User';

        return (
            <View style={styles.commentContainer}>
                <Image
                    source={{
                        uri: item.author?.avatar ||
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(item.author?.username || 'User')
                    }}
                    style={styles.avatar}
                />
                <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                        <Text style={styles.authorName}>{authorName}</Text>
                        <Text style={styles.timestamp}>
                            {formatTimestamp(item.createdAt)}
                        </Text>
                    </View>
                    <Text style={styles.commentText}>{item.content}</Text>
                </View>
            </View>
        );
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <Text style={styles.headerSubtitle}>
                {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </Text>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1877f2" />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            No comments yet. Be the first to comment!
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContent}
            />

            {/* Input area */}
            <View style={styles.inputContainer}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder="Write a comment..."
                    placeholderTextColor="#65676b"
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    maxLength={500}
                    editable={!isSubmitting}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled
                    ]}
                    onPress={handleAddComment}
                    disabled={!newComment.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="send" size={20} color="#fff" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

function formatTimestamp(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
    },
    listContent: {
        flexGrow: 1,
        paddingVertical: 8,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#050505',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#65676b',
        marginTop: 4,
        fontWeight: '500',
    },
    commentContainer: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginHorizontal: 12,
        marginVertical: 4,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e4e6eb',
    },
    commentContent: {
        flex: 1,
        marginLeft: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    authorName: {
        fontSize: 14,
        fontWeight: '700',
        color: '#050505',
        marginRight: 8,
    },
    timestamp: {
        fontSize: 12,
        color: '#65676b',
        fontWeight: '500',
    },
    commentText: {
        fontSize: 14,
        color: '#050505',
        lineHeight: 20,
    },
    emptyContainer: {
        paddingVertical: 40,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#65676b',
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#e4e6eb',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        maxHeight: 100,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        fontSize: 15,
        color: '#050505',
        fontWeight: '500',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1877f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: '#bcc0c4',
    },
});
