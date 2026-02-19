import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postsReducer from './slices/postsSlice';
import notificationsReducer from './slices/notificationsSlice';
import usersReducer from './slices/usersSlice';

/**
 * Redux Store Configuration
 * 
 * Using Redux Toolkit for:
 * - Simplified store setup
 * - Built-in Immer for immutable updates
 * - Redux DevTools integration
 * - Thunk middleware by default
 * 
 * Our store has 4 main slices:
 * - auth: User authentication state
 * - posts: Feed posts and post interactions
 * - notifications: Real-time notifications
 * - users: User profiles and follow system
 */

const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postsReducer,
        notifications: notificationsReducer,
        users: usersReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types for serialization check
                ignoredActions: ['socket/connect'],
            },
        }),
});

export default store;
