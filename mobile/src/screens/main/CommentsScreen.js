import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

/**
 * Comments Screen
 * 
 * Shows all comments on a post with:
 * - Top-level comments
 * - Nested replies (expandable)
 * - Comment input field
 * - User avatars and names
 */
export default function CommentsScreen({ route }) {
    const { postId, postAuthor } = route.params;
    const flatListRef = useRef(null);
    const [comments, setComments] = useState([
        {
            id: '1',
            author: { name: 'John Doe', avatar: 'https://ui-avatars.com/api/?name=John+Doe' },
            content: 'Great post! Really enjoyed this.',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            likesCount: 5,
            replies: [
                {
                    id: '1-1',
                    author: { name: 'Jane Smith', avatar: 'https://ui-avatars.com/api/?name=Jane+Smith' },
                    content: 'I agree! Very insightful.',
                    createdAt: new Date(Date.now() - 1800000).toISOString(),
                    likesCount: 2,
                },
            ],
            showReplies: false,
        },
        {
            id: '2',
            author: { name: 'Mike Johnson', avatar: 'https://ui-avatars.com/api/?name=Mike+Johnson' },
            content: 'Thanks for sharing this important information!',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            likesCount: 12,
            replies: [],
            showReplies: false,
        },
    ]);

    const [commentText, setCommentText] = useState('');
    const { user: currentUser } = useSelector((state) => state.auth);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;

        return date.toLocaleDateString();
    };

    const handleAddComment = () => {
        if (!commentText.trim()) return;

        const newComment = {
            id: `comment-${Date.now()}`,
            author: {
                name: currentUser?.name || currentUser?.username || 'You',
                avatar: currentUser?.avatar,
            },
            content: commentText,
            createdAt: new Date().toISOString(),
            likesCount: 0,
            replies: [],
            showReplies: false,
        };

        setComments([newComment, ...comments]);
        setCommentText('');
        flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    };

    const toggleReplies = (commentId) => {
        setComments(
            comments.map((comment) =>
                comment.id === commentId
                    ? { ...comment, showReplies: !comment.showReplies }
                    : comment
            )
        );
    };

    const renderReply = (reply) => (
        <View key={reply.id} style={styles.replyContainer}>
            <Image
                source={{ uri: reply.author.avatar }}
                style={styles.replyAvatar}
            />
            <View style={styles.replyContent}>
                <Text style={styles.replyName}>{reply.author.name}</Text>
                <Text style={styles.replyText}>{reply.content}</Text>
                <View style={styles.replyActions}>
                    <Text style={styles.replyTime}>
                        {formatTimestamp(reply.createdAt)}
                    </Text>
                    <Text style={styles.replyAction}>Like</Text>
                    <Text style={styles.replyAction}>Reply</Text>
                </View>
            </View>
        </View>
    );

    const renderComment = ({ item }) => (
        <View style={styles.commentContainer}>
            {/* Comment */}
            <View style={styles.comment}>
                <Image
                    source={{ uri: item.author.avatar }}
                    style={styles.avatar}
                />
                <View style={styles.commentContent}>
                    <View style={styles.commentBubble}>
                        <Text style={styles.authorName}>{item.author.name}</Text>
                        <Text style={styles.commentText}>{item.content}</Text>
                    </View>
                    <View style={styles.commentActions}>
                        <Text style={styles.actionText}>
                            {formatTimestamp(item.createdAt)}
                        </Text>
                        <Text style={styles.actionText}>Like</Text>
                        <Text style={styles.actionText}>Reply</Text>
                        {item.likesCount > 0 && (
                            <Text style={styles.likeCount}>
                                {item.likesCount} {item.likesCount === 1 ? 'like' : 'likes'}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            {/* Replies */}
            {item.replies.length > 0 && (
                <View style={styles.repliesSection}>
                    {item.showReplies ? (
                        <>
                            {item.replies.map((reply) => renderReply(reply))}
                            <TouchableOpacity
                                style={styles.viewLessButton}
                                onPress={() => toggleReplies(item.id)}
                            >
                                <Text style={styles.viewLessText}>Hide replies</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={styles.viewRepliesButton}
                            onPress={() => toggleReplies(item.id)}
                        >
                            <Text style={styles.viewRepliesText}>
                                View {item.replies.length} {item.replies.length === 1 ? 'reply' : 'replies'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Comments List */}
            <FlatList
                ref={flatListRef}
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
                scrollEventThrottle={16}
            />

            {/* Input Section */}
            <View style={styles.inputContainer}>
                <Image
                    source={{
                        uri: currentUser?.avatar ||
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(currentUser?.name || 'You'),
                    }}
                    style={styles.currentUserAvatar}
                />
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a comment..."
                        placeholderTextColor="#ccc"
                        value={commentText}
                        onChangeText={setCommentText}
                        multiline
                        maxHeight={100}
                    />
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            !commentText.trim() && styles.submitButtonDisabled,
                        ]}
                        onPress={handleAddComment}
                        disabled={!commentText.trim()}
                    >
                        <Ionicons
                            name="send"
                            size={18}
                            color={commentText.trim() ? '#1877f2' : '#ccc'}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    commentsList: {
        paddingVertical: 12,
    },
    commentContainer: {
        paddingHorizontal: 12,
        paddingBottom: 8,
    },
    comment: {
        flexDirection: 'row',
        gap: 8,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginTop: 4,
    },
    commentContent: {
        flex: 1,
    },
    commentBubble: {
        backgroundColor: '#f0f2f5',
        borderRadius: 12,
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
    commentActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 6,
        alignItems: 'center',
    },
    actionText: {
        fontSize: 12,
        color: '#65676b',
        fontWeight: '500',
    },
    likeCount: {
        fontSize: 12,
        color: '#65676b',
        marginLeft: 4,
    },
    repliesSection: {
        marginLeft: 44,
        marginTop: 8,
        borderLeftWidth: 2,
        borderLeftColor: '#e4e6eb',
        paddingLeft: 12,
    },
    viewRepliesButton: {
        paddingVertical: 4,
    },
    viewRepliesText: {
        fontSize: 13,
        color: '#1877f2',
        fontWeight: '500',
    },
    viewLessButton: {
        paddingVertical: 8,
    },
    viewLessText: {
        fontSize: 13,
        color: '#1877f2',
        fontWeight: '500',
    },
    replyContainer: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    replyAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        marginTop: 4,
    },
    replyContent: {
        flex: 1,
    },
    replyName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#050505',
        marginBottom: 2,
    },
    replyText: {
        fontSize: 12,
        color: '#050505',
        lineHeight: 16,
    },
    replyActions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
        alignItems: 'center',
    },
    replyTime: {
        fontSize: 11,
        color: '#65676b',
    },
    replyAction: {
        fontSize: 11,
        color: '#65676b',
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#e4e6eb',
        backgroundColor: '#fff',
        gap: 8,
    },
    currentUserAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    inputWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 13,
        color: '#050505',
        maxHeight: 80,
    },
    submitButton: {
        padding: 6,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
});
