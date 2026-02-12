import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationsAPI } from '../../api/notifications';

/**
 * Notifications Slice
 * 
 * Manages notifications with:
 * - Real-time updates via Socket.io
 * - Unread count
 * - Mark as read functionality
 */

// Fetch notifications
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationsAPI.getNotifications();
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch notifications'
            );
        }
    }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { rejectWithValue }) => {
        try {
            await notificationsAPI.markAsRead(notificationId);
            return notificationId;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to mark as read'
            );
        }
    }
);

// Mark all as read
export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationsAPI.markAllAsRead();
            return null;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to mark all as read'
            );
        }
    }
);

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        isLoading: false,
        error: null,
    },
    reducers: {
        // Add a new notification (from Socket.io)
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            if (!action.payload.read) {
                state.unreadCount += 1;
            }
        },

        // Clear all notifications
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
        },
    },
    extraReducers: (builder) => {
        // Fetch Notifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.items = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
                state.isLoading = false;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });

        // Mark as Read
        builder
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notificationId = action.payload;
                const notification = state.items.find((n) => n.id === notificationId);
                if (notification && !notification.read) {
                    notification.read = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });

        // Mark All as Read
        builder
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.items.forEach((notification) => {
                    notification.read = true;
                });
                state.unreadCount = 0;
            });
    },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
