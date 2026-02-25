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
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchConversations } from '../../store/slices/messagesSlice';

/**
 * Conversations Screen
 * 
 * Shows list of user conversations with:
 * - Last message preview
 * - Unread indicators
 * - User avatars and names
 * - Timestamps
 */
export default function ConversationsScreen() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { conversations, isLoadingConversations } = useSelector((state) => state.messages);

    useEffect(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        dispatch(fetchConversations());
    }, [dispatch]);

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'now';
        if (minutes < 60) return `${minutes}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;

        return date.toLocaleDateString();
    };

    const renderConversation = ({ item }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => navigation.navigate('Chat', { userId: item.userId, userName: item.userName })}
            activeOpacity={0.7}
        >
            {/* Avatar with unread indicator */}
            <View style={styles.avatarContainer}>
                <Image
                    source={{
                        uri: item.userAvatar ||
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(item.userName || 'User'),
                    }}
                    style={styles.avatar}
                />
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadBadgeText}>
                            {item.unreadCount > 99 ? '99+' : item.unreadCount}
                        </Text>
                    </View>
                )}
            </View>

            {/* Conversation info */}
            <View style={styles.conversationInfo}>
                <Text 
                    style={[
                        styles.conversationName,
                        item.unreadCount > 0 && styles.unreadName,
                    ]}
                >
                    {item.userName}
                </Text>
                <Text 
                    style={[
                        styles.lastMessage,
                        item.unreadCount > 0 && styles.unreadMessage,
                    ]}
                    numberOfLines={1}
                >
                    {item.lastMessage}
                </Text>
            </View>

            {/* Timestamp */}
            <Text style={styles.timestamp}>
                {formatTimestamp(item.lastMessageAt)}
            </Text>
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>Start a conversation by finding friends</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chats</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <Ionicons name="add-circle" size={28} color="#1877f2" />
                </TouchableOpacity>
            </View>

            {/* Conversations List */}
            {isLoadingConversations && conversations.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#1877f2" />
                </View>
            ) : (
                <FlatList
                    data={conversations}
                    renderItem={renderConversation}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoadingConversations}
                            onRefresh={handleRefresh}
                            tintColor="#1877f2"
                        />
                    }
                />
            )}
        </View>
    );
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
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#050505',
    },
    headerButton: {
        padding: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 12,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    unreadBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#f02849',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    unreadBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
    conversationInfo: {
        flex: 1,
    },
    conversationName: {
        fontSize: 15,
        color: '#65676b',
        marginBottom: 4,
    },
    unreadName: {
        color: '#050505',
        fontWeight: '600',
    },
    lastMessage: {
        fontSize: 13,
        color: '#65676b',
        lineHeight: 18,
    },
    unreadMessage: {
        fontWeight: '500',
    },
    timestamp: {
        fontSize: 12,
        color: '#65676b',
        marginLeft: 12,
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
