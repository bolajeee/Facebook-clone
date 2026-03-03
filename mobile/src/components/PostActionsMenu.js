import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { postsAPI } from '../api/posts';
import { deletePost } from '../store/slices/postsSlice';

/**
 * Post Actions Menu Component
 * 
 * Shows a menu with actions for a post:
 * - Edit (only for post author)
 * - Delete (only for post author)
 * - Report (for other users)
 * 
 * Features:
 * - Context-aware actions (different for author vs others)
 * - Delete confirmation dialog
 * - Loading states
 * - Error handling
 */

export default function PostActionsMenu({
    post,
    isVisible,
    onClose,
    onEditPress,
    onDeletePress,
}) {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const [isDeleting, setIsDeleting] = useState(false);

    const isPostAuthor = post?.author?.id === currentUser?.id;

    const handleDeletePost = () => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    onPress: () => {},
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        await performDeletePost();
                    },
                    style: 'destructive',
                },
            ]
        );
    };

    const performDeletePost = async () => {
        try {
            setIsDeleting(true);

            // Call API
            await postsAPI.deletePost(post.id);

            // Update Redux
            dispatch(deletePost(post.id));

            // Close menu
            onClose();

            // Notify parent
            if (onDeletePress) {
                onDeletePress();
            }

            Alert.alert('Success', 'Post deleted successfully');
        } catch (error) {
            console.error('[v0] Delete post error:', error);
            Alert.alert('Error', 'Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReportPost = () => {
        Alert.alert(
            'Report Post',
            'What is the reason for reporting this post?',
            [
                { text: 'Spam', onPress: () => submitReport('SPAM') },
                { text: 'Offensive', onPress: () => submitReport('OFFENSIVE') },
                { text: 'Misinformation', onPress: () => submitReport('MISINFORMATION') },
                { text: 'Other', onPress: () => submitReport('OTHER') },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const submitReport = (reason) => {
        // TODO: Implement report endpoint
        Alert.alert('Reported', 'Thank you for reporting this post. We will review it shortly.');
        onClose();
    };

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            {/* Overlay */}
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Menu */}
            <View style={styles.menuContainer}>
                <View style={styles.menu}>
                    {/* Header */}
                    <View style={styles.menuHeader}>
                        <Text style={styles.menuTitle}>Post Options</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Menu Items */}
                    {isPostAuthor ? (
                        <>
                            {/* Edit Option */}
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    onClose();
                                    if (onEditPress) {
                                        onEditPress();
                                    }
                                }}
                            >
                                <Ionicons name="create" size={20} color="#1877f2" />
                                <Text style={styles.menuItemText}>Edit Post</Text>
                            </TouchableOpacity>

                            {/* Delete Option */}
                            <TouchableOpacity
                                style={[styles.menuItem, styles.deleteItem]}
                                onPress={handleDeletePost}
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <ActivityIndicator size="small" color="#ff6b6b" />
                                ) : (
                                    <Ionicons name="trash" size={20} color="#ff6b6b" />
                                )}
                                <Text style={[styles.menuItemText, styles.deleteText]}>
                                    Delete Post
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            {/* Report Option (for non-authors) */}
                            <TouchableOpacity
                                style={[styles.menuItem, styles.reportItem]}
                                onPress={handleReportPost}
                            >
                                <Ionicons name="flag" size={20} color="#ff6b6b" />
                                <Text style={[styles.menuItemText, styles.reportText]}>
                                    Report Post
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
    menu: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    deleteItem: {
        borderBottomWidth: 0,
    },
    reportItem: {
        borderBottomWidth: 0,
    },
    menuItemText: {
        marginLeft: 16,
        fontSize: 14,
        color: '#1877f2',
        fontWeight: '500',
    },
    deleteText: {
        color: '#ff6b6b',
    },
    reportText: {
        color: '#ff6b6b',
    },
});
