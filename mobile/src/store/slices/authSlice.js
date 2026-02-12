import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../../api/auth';

/**
 * Auth Slice
 * 
 * Manages authentication state including:
 * - User data
 * - Loading states
 * - Error messages
 * - Token persistence
 * 
 * Why AsyncThunks:
 * - Handle async operations (API calls)
 * - Automatically dispatch pending/fulfilled/rejected actions
 * - Clean error handling
 */

// Async thunk for login
export const login = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(credentials);
            const { user, accessToken, refreshToken } = response.data;

            // Persist tokens and user data
            await AsyncStorage.multiSet([
                ['accessToken', accessToken],
                ['refreshToken', refreshToken],
                ['user', JSON.stringify(user)],
            ]);

            return { user, accessToken, refreshToken };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Login failed'
            );
        }
    }
);

// Async thunk for registration
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authAPI.register(userData);
            const { user, accessToken, refreshToken } = response.data;

            // Persist tokens and user data
            await AsyncStorage.multiSet([
                ['accessToken', accessToken],
                ['refreshToken', refreshToken],
                ['user', JSON.stringify(user)],
            ]);

            return { user, accessToken, refreshToken };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Registration failed'
            );
        }
    }
);

// Async thunk for logout
export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await authAPI.logout();
            // Clear all stored data
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            return null;
        } catch (error) {
            // Even if API call fails, clear local data
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            return null;
        }
    }
);

// Async thunk to check if user is already logged in (on app start)
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            const [accessToken, refreshToken, userJson] = await AsyncStorage.multiGet([
                'accessToken',
                'refreshToken',
                'user',
            ]);

            if (accessToken[1] && refreshToken[1] && userJson[1]) {
                return {
                    user: JSON.parse(userJson[1]),
                    accessToken: accessToken[1],
                    refreshToken: refreshToken[1],
                };
            }

            return rejectWithValue('No stored credentials');
        } catch (error) {
            return rejectWithValue('Failed to check auth');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        accessToken: null,
        refreshToken: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
        isCheckingAuth: true, // For splash screen
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
        },
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });

        // Logout
        builder
            .addCase(logout.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
            });

        // Check Auth
        builder
            .addCase(checkAuth.pending, (state) => {
                state.isCheckingAuth = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isCheckingAuth = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isCheckingAuth = false;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
