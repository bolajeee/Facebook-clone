import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../../store/slices/notificationsSlice';
import NotificationItem from '../../components/NotificationItem';

/**
 * Notifications Screen (Modernized)
 * 
 * Displays real-time notifications with:
 * - Different notification types (like, comment, follow, mention)
 * - User avatars and action descriptions
 * - Timestamps
 * - Mark as read functionality
 * - Pull to refresh with modern card design
 */

export default function NotificationsScreen() {
    const dispatch = useDispatch();
    const { items: notifications, unreadCount, isLoading, isLoadingMore, hasMore, nextCursor, error } = useSelector(
        (state) => state.notifications
    );

    useEffect(() => {
        // Fetch notifications on mount
        dispatch(fetchNotifications({ cursor: null, limit: 20 }));
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        dispatch(fetchNotifications({ cursor: null, limit: 20 }));
    }, [dispatch]);

    const handleLoadMore = useCallback(() => {
        if (!isLoadingMore && hasMore && nextCursor) {
            dispatch(fetchNotifications({ cursor: nextCursor, limit: 20 }));
        }
    }, [isLoadingMore, hasMore, nextCursor, dispatch]);

    const handleNotificationPress = (notification) => {
        // Mark as read
        if (!notification.isRead) {
            dispatch(markAsRead(notification.id));
        }

        // TODO: Navigate to notification details or post
        console.log('Notification pressed:', notification);
    };

    const handleActionPress = (notificationId) => {
        console.log('Action pressed for notification:', notificationId);
    };

    const handleMarkAllAsRead = () => {
        dispatch(markAllAsRead());
    };

    const renderNotification = ({ item }) => (
        <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onActionPress={handleActionPress}
        />
    );

    const renderEmpty = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1877f2" />
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#f02849" />
                    <Text style={styles.emptyText}>Failed to load notifications</Text>
                    <Text style={styles.emptySubtext}>{error}</Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="notifications-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>No notifications yet</Text>
                <Text style={styles.emptySubtext}>
                    You'll see notifications from your friends here
                </Text>
            </View>
        );
    };

    const renderFooter = () => {
        if (!isLoadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#1877f2" />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                    <TouchableOpacity
                        style={styles.markAllButton}
                        onPress={handleMarkAllAsRead}
                    >
                        <Text style={styles.markAllText}>Mark all as read</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading && !isLoadingMore}
                        onRefresh={handleRefresh}
                        colors={['#1877f2']}
                        tintColor="#1877f2"
                    />
                }
                scrollEventThrottle={16}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#050505',
    },
    markAllButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    markAllText: {
        fontSize: 13,
        color: '#1877f2',
        fontWeight: '600',
    },
    listContent: {
        paddingVertical: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#050505',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 13,
        color: '#65676b',
        marginTop: 8,
        textAlign: 'center',
    },
    footerLoader: {
        paddingVertical: 20,
        alignItems: 'center',
    },
});
