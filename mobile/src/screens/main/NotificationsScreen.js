import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
} from '../../store/slices/notificationsSlice';

/**
 * Notifications Screen
 * 
 * Shows real-time notifications with:
 * - List of notifications (likes, comments, follows)
 * - Mark as read functionality
 * - Pull to refresh
 * - Pagination
 * - Real-time updates via Socket.io
 * - Unread badge
 */

export default function NotificationsScreen() {
    const dispatch = useDispatch();
    const {
        items: notifications,
        unreadCount,
        isLoading,
        isLoadingMore,
        hasMore,
        nextCursor,
        error,
    } = useSelector((state) => state.notifications);

    // Initial load
    useEffect(() => {
        if (notifications.length === 0 && !isLoading) {
            dispatch(fetchNotifications({}));
        }
    }, []);

    // Pull to refresh
    const handleRefresh = useCallback(() => {
        dispatch(fetchNotifications({}));
    }, [dispatch]);

    // Load more
    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && hasMore && nextCursor) {
            dispatch(fetchNotifications({ cursor: nextCursor }));
        }
    }, [isLoadingMore, hasMore, nextCursor, dispatch]);

    // Mark notification as read
    const handleNotificationPress = (notification) => {
        if (!notification.isRead) {
            dispatch(markAsRead(notification.id));
        }
        // TODO: Navigate to relevant screen (post, profile, etc.)
    };

    // Mark all as read
    const handleMarkAllRead = () => {
        if (unreadCount > 0) {
            dispatch(markAllAsRead());
        }
    };

    // Render notification item
    const renderNotification = ({ item }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.notificationItem,
                    !item.isRead && styles.unreadNotification,
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
            >
                {/* Actor avatar */}
                {item.actor && (
                    <Image
                        source={{
                            uri:
                                item.actor.avatar ||
                                'https://ui-avatars.com/api/?name=' +
                                encodeURIComponent(item.actor.username),
                        }}
                        style={styles.avatar}
                    />
                )}

                {/* Notification content */}
                <View style={styles.notificationContent}>
                    <Text style={styles.notificationText}>
                        {item.actor && (
                            <Text style={styles.actorName}>
                                {item.actor.firstName && item.actor.lastName
                                    ? `${item.actor.firstName} ${item.actor.lastName}`
                                    : item.actor.username}
                            </Text>
                        )}
                        {' '}
                        {getNotificationMessage(item)}
                    </Text>
                    <Text style={styles.timestamp}>
                        {formatTimestamp(item.createdAt)}
                    </Text>
                </View>

                {/* Unread indicator */}
                {!item.isRead && <View style={styles.unreadDot} />}

                {/* Post thumbnail if applicable */}
                {item.post?.imageUrl && (
                    <Image
                        source={{ uri: item.post.imageUrl }}
                        style={styles.postThumbnail}
                    />
                )}
            </TouchableOpacity>
        );
    };

    // Footer: loading indicator
    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#1877f2" />
            </View>
        );
    };

    // Empty state
    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#1877f2" />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyTitle}>😕 Something went wrong</Text>
                    <Text style={styles.emptyText}>{error}</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>🔔 No notifications yet</Text>
                <Text style={styles.emptyText}>
                    When someone likes or comments on your posts, you'll see it here
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAllRead}>
                        <Text style={styles.markAllButton}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Unread count badge */}
            {unreadCount > 0 && (
                <View style={styles.unreadBanner}>
                    <Text style={styles.unreadBannerText}>
                        {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                    </Text>
                </View>
            )}

            {/* Notifications list */}
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && notifications.length > 0}
                        onRefresh={handleRefresh}
                        colors={['#1877f2']}
                        tintColor="#1877f2"
                    />
                }
            />
        </View>
    );
}

/**
 * Get notification message based on type
 */
function getNotificationMessage(notification) {
    switch (notification.type) {
        case 'LIKE':
            return 'liked your post';
        case 'COMMENT':
            return 'commented on your post';
        case 'FOLLOW':
            return 'started following you';
        case 'MENTION':
            return 'mentioned you in a comment';
        default:
            return notification.message || 'sent you a notification';
    }
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp) {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return notifDate.toLocaleDateString();
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#050505',
    },
    markAllButton: {
        fontSize: 14,
        color: '#1877f2',
        fontWeight: '600',
    },
    unreadBanner: {
        backgroundColor: '#e7f3ff',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1877f2',
    },
    unreadBannerText: {
        fontSize: 13,
        color: '#1877f2',
        fontWeight: '600',
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
        backgroundColor: '#fff',
    },
    unreadNotification: {
        backgroundColor: '#f0f8ff',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e4e6eb',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationText: {
        fontSize: 15,
        color: '#050505',
        lineHeight: 20,
    },
    actorName: {
        fontWeight: '600',
        color: '#050505',
    },
    timestamp: {
        fontSize: 13,
        color: '#65676b',
        marginTop: 4,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#1877f2',
        marginLeft: 8,
    },
    postThumbnail: {
        width: 48,
        height: 48,
        borderRadius: 4,
        backgroundColor: '#e4e6eb',
        marginLeft: 8,
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#050505',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#65676b',
        textAlign: 'center',
        lineHeight: 20,
    },
});
