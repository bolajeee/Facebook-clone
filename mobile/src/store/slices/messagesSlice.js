import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client';

/**
 * Async thunks
 */
export const fetchConversations = createAsyncThunk(
    'messages/fetchConversations',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/messages/conversations');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations');
        }
    }
);

export const fetchChatMessages = createAsyncThunk(
    'messages/fetchChatMessages',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/messages/${userId}`);
            return { userId, messages: response.data.data };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
        }
    }
);

export const sendMessage = createAsyncThunk(
    'messages/sendMessage',
    async ({ recipientId, content }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/messages/send', {
                recipientId,
                content,
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to send message');
        }
    }
);

/**
 * Messages Slice
 * 
 * Manages:
 * - Conversations list
 * - Messages for individual chats
 * - Message sending
 */
const messagesSlice = createSlice({
    name: 'messages',
    initialState: {
        conversations: [],
        messagesByUserId: {}, // { userId: [messages] }
        isLoadingConversations: false,
        isLoadingMessages: false,
        isSendingMessage: false,
        error: null,
    },
    reducers: {
        addMessageOptimistic: (state, action) => {
            const { userId, message } = action.payload;
            if (!state.messagesByUserId[userId]) {
                state.messagesByUserId[userId] = [];
            }
            state.messagesByUserId[userId].push(message);
        },
        clearMessages: (state) => {
            state.conversations = [];
            state.messagesByUserId = {};
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch conversations
            .addCase(fetchConversations.pending, (state) => {
                state.isLoadingConversations = true;
                state.error = null;
            })
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.isLoadingConversations = false;
                state.conversations = action.payload;
            })
            .addCase(fetchConversations.rejected, (state, action) => {
                state.isLoadingConversations = false;
                state.error = action.payload;
            })
            // Fetch chat messages
            .addCase(fetchChatMessages.pending, (state) => {
                state.isLoadingMessages = true;
                state.error = null;
            })
            .addCase(fetchChatMessages.fulfilled, (state, action) => {
                state.isLoadingMessages = false;
                const { userId, messages } = action.payload;
                state.messagesByUserId[userId] = messages;
            })
            .addCase(fetchChatMessages.rejected, (state, action) => {
                state.isLoadingMessages = false;
                state.error = action.payload;
            })
            // Send message
            .addCase(sendMessage.pending, (state) => {
                state.isSendingMessage = true;
                state.error = null;
            })
            .addCase(sendMessage.fulfilled, (state, action) => {
                state.isSendingMessage = false;
                const { recipientId } = action.meta.arg;
                if (!state.messagesByUserId[recipientId]) {
                    state.messagesByUserId[recipientId] = [];
                }
                state.messagesByUserId[recipientId].push(action.payload);
            })
            .addCase(sendMessage.rejected, (state, action) => {
                state.isSendingMessage = false;
                state.error = action.payload;
            });
    },
});

export const { addMessageOptimistic, clearMessages } = messagesSlice.actions;
export default messagesSlice.reducer;
