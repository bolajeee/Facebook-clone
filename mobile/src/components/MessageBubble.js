import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

/**
 * Message Bubble Component
 * 
 * Renders individual message in a chat with:
 * - Different styling for sender vs receiver
 * - Timestamp
 * - User avatar (for receiver messages)
 */
export default function MessageBubble({ 
    message, 
    isSender = false,
    senderName = 'User',
    senderAvatar = null
}) {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    if (isSender) {
        return (
            <View style={styles.senderContainer}>
                <View style={styles.senderBubble}>
                    <Text style={styles.senderText}>{message.content}</Text>
                </View>
                <Text style={styles.timestamp}>{formatTime(message.createdAt)}</Text>
            </View>
        );
    }

    return (
        <View style={styles.receiverContainer}>
            {/* Avatar */}
            <Image
                source={{
                    uri: senderAvatar ||
                        'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(senderName || 'User'),
                }}
                style={styles.avatar}
            />
            
            {/* Message bubble */}
            <View style={styles.receiverBubbleWrapper}>
                <View style={styles.receiverBubble}>
                    <Text style={styles.receiverText}>{message.content}</Text>
                </View>
                <Text style={styles.timestamp}>{formatTime(message.createdAt)}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    // Sender message
    senderContainer: {
        alignItems: 'flex-end',
        marginBottom: 8,
        marginRight: 12,
        gap: 2,
    },
    senderBubble: {
        backgroundColor: '#e7f3ff',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: '85%',
    },
    senderText: {
        fontSize: 15,
        color: '#050505',
        lineHeight: 20,
    },
    // Receiver message
    receiverContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
        marginLeft: 12,
        gap: 8,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
    },
    receiverBubbleWrapper: {
        gap: 2,
    },
    receiverBubble: {
        backgroundColor: '#e4e6eb',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxWidth: '85%',
    },
    receiverText: {
        fontSize: 15,
        color: '#050505',
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        color: '#65676b',
        marginHorizontal: 12,
    },
});
