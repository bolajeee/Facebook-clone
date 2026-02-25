import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
    fetchChatMessages,
    sendMessage,
    addMessageOptimistic,
} from '../../store/slices/messagesSlice';
import MessageBubble from '../../components/MessageBubble';

/**
 * Chat Screen
 * 
 * Individual chat conversation with:
 * - Message list with bubbles
 * - Message input field
 * - Send button
 * - Typing indicators
 */
export default function ChatScreen({ route }) {
    const { userId, userName } = route.params;
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const flatListRef = useRef(null);

    const [messageText, setMessageText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const { messagesByUserId, isLoadingMessages, isSendingMessage } = useSelector(
        (state) => state.messages
    );
    const { user: currentUser } = useSelector((state) => state.auth);

    const messages = messagesByUserId[userId] || [];

    useEffect(() => {
        // Set header with user info
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitle}>
                    <Text style={styles.headerUserName}>{userName}</Text>
                </View>
            ),
        });

        // Fetch messages for this user
        dispatch(fetchChatMessages(userId));
    }, [userId, dispatch, navigation]);

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    const handleSendMessage = useCallback(() => {
        if (!messageText.trim()) return;

        // Optimistic UI update
        const optimisticMessage = {
            id: `temp-${Date.now()}`,
            content: messageText,
            createdAt: new Date().toISOString(),
            senderId: currentUser.id,
            recipientId: userId,
        };

        dispatch(addMessageOptimistic({ userId, message: optimisticMessage }));
        setMessageText('');

        // API call
        dispatch(sendMessage({ recipientId: userId, content: messageText }));
    }, [messageText, userId, dispatch, currentUser.id]);

    const renderMessage = useCallback(({ item }) => {
        const isSender = item.senderId === currentUser.id;
        return (
            <MessageBubble
                message={item}
                isSender={isSender}
                senderName={isSender ? 'You' : userName}
                senderAvatar={
                    isSender
                        ? currentUser.avatar
                        : 'https://ui-avatars.com/api/?name=' +
                          encodeURIComponent(userName || 'User')
                }
            />
        );
    }, [currentUser, userName]);

    const renderLoadingHeader = () => {
        if (!isLoadingMessages) return null;
        return (
            <View style={styles.loadingHeader}>
                <ActivityIndicator size="small" color="#1877f2" />
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Messages List */}
            <View style={styles.messagesContainer}>
                {isLoadingMessages && messages.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1877f2" />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        renderItem={renderMessage}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.messagesList}
                        ListHeaderComponent={renderLoadingHeader}
                        onContentSizeChange={() =>
                            flatListRef.current?.scrollToEnd({ animated: true })
                        }
                        scrollEventThrottle={16}
                    />
                )}

                {/* Typing indicator */}
                {isTyping && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                        <View style={styles.typingDot} />
                    </View>
                )}
            </View>

            {/* Input Section */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    {/* Attachment button */}
                    <TouchableOpacity
                        style={styles.attachButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add" size={28} color="#1877f2" />
                    </TouchableOpacity>

                    {/* Input field */}
                    <TextInput
                        style={styles.input}
                        placeholder="Aa"
                        placeholderTextColor="#ccc"
                        value={messageText}
                        onChangeText={setMessageText}
                        multiline
                        maxHeight={100}
                        onFocus={() => setIsTyping(false)}
                        onBlur={() => setIsTyping(false)}
                    />

                    {/* Send button */}
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!messageText.trim() || isSendingMessage) &&
                                styles.sendButtonDisabled,
                        ]}
                        onPress={handleSendMessage}
                        disabled={!messageText.trim() || isSendingMessage}
                        activeOpacity={0.7}
                    >
                        {isSendingMessage ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
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
    headerTitle: {
        alignItems: 'center',
    },
    headerUserName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#050505',
    },
    messagesContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    messagesList: {
        paddingVertical: 12,
        paddingHorizontal: 0,
    },
    loadingHeader: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    typingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 12,
        marginBottom: 8,
        gap: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#ccc',
    },
    inputContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#e4e6eb',
        backgroundColor: '#fff',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    attachButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        color: '#050505',
        maxHeight: 100,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#1877f2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#ccc',
    },
});
