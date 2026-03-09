import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Notification Item Component
 * 
 * Displays individual notification with:
 * - User avatar
 * - Action description (e.g., "liked your post")
 * - Timestamp
 * - Optional action button
 */
export default function NotificationItem({ 
    notification, 
    onPress,
    onActionPress 
}) {
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

    const getNotificationIcon = () => {
        switch ((notification.type || '').toUpperCase()) {
            case 'LIKE':
                return { icon: 'heart', color: '#f02849' };
            case 'COMMENT':
                return { icon: 'chatbubble', color: '#1877f2' };
            case 'FOLLOW':
                return { icon: 'person-add', color: '#1877f2' };
            case 'MENTION':
                return { icon: 'at', color: '#1877f2' };
            default:
                return { icon: 'notifications', color: '#1877f2' };
        }
    };

    const icon = getNotificationIcon();

    return (
        <TouchableOpacity 
            style={[styles.container, !notification.isRead && styles.unread]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <Image
                source={{
                    uri: notification.actor?.avatar || notification.actor?.avatarUrl ||
                        'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(notification.actor?.name || 'User'),
                }}
                style={styles.avatar}
            />

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.message}>
                    <Text style={styles.nameText}>
                        {notification.actor?.firstName ? `${notification.actor.firstName} ${notification.actor.lastName || ''}` : notification.actor?.name || 'User'}
                    </Text>
                    <Text style={styles.actionText}> {notification.message}</Text>
                </Text>
                <Text style={styles.timestamp}>
                    {formatTimestamp(notification.createdAt)}
                </Text>
            </View>

            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                <Ionicons name={icon.icon} size={20} color={icon.color} />
            </View>

            {/* Action button (optional) */}
            {notification.actionButton && (
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => onActionPress(notification.id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.actionButtonText}>
                        {notification.actionButton}
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
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
    unread: {
        backgroundColor: 'rgba(24, 119, 242, 0.08)',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#e4e6eb',
    },
    content: {
        flex: 1,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    nameText: {
        fontWeight: '700',
        color: '#050505',
    },
    actionText: {
        color: '#65676b',
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
        color: '#65676b',
        fontWeight: '500',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    actionButton: {
        marginLeft: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#1877f2',
        borderRadius: 6,
        minHeight: 36,
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
    },
});
