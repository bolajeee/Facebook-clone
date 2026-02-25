import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import NotificationItem from '../../components/NotificationItem';

/**
 * Notifications Screen
 * 
 * Displays real-time notifications with:
 * - Different notification types (like, comment, follow, mention)
 * - User avatars and action descriptions
 * - Timestamps
 * - Mark as read functionality
 */

// Mock notifications data - replace with Redux fetch action
const mockNotifications = [
    {
        id: '1',
        type: 'like',
        actor: {
            id: 'user1',
            name: 'Sarah Johnson',
            firstName: 'Sarah',
            lastName: 'Johnson',
            avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
        },
        message: 'liked your post',
        createdAt: new Date(Date.now() - 300000).toISOString(),
        isRead: false,
    },
    {
        id: '2',
        type: 'comment',
        actor: {
            id: 'user2',
            name: 'Alex Chen',
            firstName: 'Alex',
            lastName: 'Chen',
            avatar: 'https://ui-avatars.com/api/?name=Alex+Chen',
        },
        message: 'commented on your post',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        isRead: false,
    },
    {
        id: '3',
        type: 'follow',
        actor: {
            id: 'user3',
            name: 'Emma Davis',
            firstName: 'Emma',
            lastName: 'Davis',
            avatar: 'https://ui-avatars.com/api/?name=Emma+Davis',
        },
        message: 'started following you',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
        actionButton: 'Follow Back',
    },
    {
        id: '4',
        type: 'like',
        actor: {
            id: 'user4',
            name: 'Michael Brown',
            firstName: 'Michael',
            lastName: 'Brown',
            avatar: 'https://ui-avatars.com/api/?name=Michael+Brown',
        },
        message: 'liked your comment',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
    },
    {
        id: '5',
        type: 'mention',
        actor: {
            id: 'user5',
            name: 'Jessica White',
            firstName: 'Jessica',
            lastName: 'White',
            avatar: 'https://ui-avatars.com/api/?name=Jessica+White',
        },
        message: 'mentioned you in a comment',
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        isRead: true,
    },
];

export default function NotificationsScreen() {
    const dispatch = useDispatch();
    const [notifications, setNotifications] = React.useState(mockNotifications);
    const [isRefreshing, setIsRefreshing] = React.useState(false);

    useEffect(() => {
        // TODO: Replace with actual Redux fetch action
        // dispatch(fetchNotifications());
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        setIsRefreshing(true);
        // TODO: Replace with actual Redux fetch action
        setTimeout(() => setIsRefreshing(false), 1000);
    }, []);

    const handleNotificationPress = (notification) => {
        // Mark as read
        setNotifications(
            notifications.map((n) =>
                n.id === notification.id ? { ...n, isRead: true } : n
            )
        );
        // TODO: Navigate to notification details or post
        console.log('Notification pressed:', notification);
    };

    const handleActionPress = (notificationId) => {
        console.log('Action pressed for notification:', notificationId);
        // TODO: Handle action button press (e.g., follow back)
    };

    const renderNotification = ({ item }) => (
        <NotificationItem
            notification={item}
            onPress={() => handleNotificationPress(item)}
            onActionPress={handleActionPress}
        />
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="notifications-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
                You'll see notifications from your friends here
            </Text>
        </View>
    );

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notifications</Text>
            </View>

            {/* Notifications List */}
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#1877f2"
                    />
                }
                scrollEventThrottle={16}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#050505',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
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
});
