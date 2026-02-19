import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersAPI } from '../../api/users';

/**
 * Users Slice
 * 
 * Manages user profiles and follow system with:
 * - User profile data
 * - Follow/unfollow actions
 * - Optimistic updates
 * - Loading states
 */

// Fetch user profile
export const fetchUserProfile = createAsyncThunk(
    'users/fetchUserProfile',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await usersAPI.getUserProfile(userId);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user profile'
            );
        }
    }
);

// Update profile
export const updateProfile = createAsyncThunk(
    'users/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await usersAPI.updateProfile(profileData);
            return response.data.user;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update profile'
            );
        }
    }
);

// Follow user
export const followUser = createAsyncThunk(
    'users/followUser',
    async (userId, { rejectWithValue }) => {
        try {
            await usersAPI.followUser(userId);
            return { userId };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to follow user'
            );
        }
    }
);

// Unfollow user
export const unfollowUser = createAsyncThunk(
    'users/unfollowUser',
    async (userId, { rejectWithValue }) => {
        try {
            await usersAPI.unfollowUser(userId);
            return { userId };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to unfollow user'
            );
        }
    }
);

// Fetch user posts
export const fetchUserPosts = createAsyncThunk(
    'users/fetchUserPosts',
    async ({ userId, cursor = null, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await usersAPI.getUserPosts(userId, cursor, limit);
            return { userId, ...response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch user posts'
            );
        }
    }
);

const usersSlice = createSlice({
    name: 'users',
    initialState: {
        // User profiles by ID
        profiles: {}, // { userId: profileData }

        // User posts by user ID
        userPosts: {}, // { userId: { postIds: [], nextCursor, hasMore } }

        // Loading states
        isLoadingProfile: false,
        isLoadingPosts: false,
        isUpdatingProfile: false,

        error: null,
    },
    reducers: {
        // Optimistic follow
        optimisticFollow: (state, action) => {
            const { userId } = action.payload;
            if (state.profiles[userId]) {
                state.profiles[userId].isFollowing = true;
                state.profiles[userId].followersCount += 1;
            }
        },

        // Optimistic unfollow
        optimisticUnfollow: (state, action) => {
            const { userId } = action.payload;
            if (state.profiles[userId]) {
                state.profiles[userId].isFollowing = false;
                state.profiles[userId].followersCount -= 1;
            }
        },

        // Clear user data
        clearUserData: (state, action) => {
            const { userId } = action.payload;
            delete state.profiles[userId];
            delete state.userPosts[userId];
        },
    },
    extraReducers: (builder) => {
        // Fetch User Profile
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoadingProfile = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                const user = action.payload;
                state.profiles[user.id] = user;
                state.isLoadingProfile = false;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoadingProfile = false;
            });

        // Update Profile
        builder
            .addCase(updateProfile.pending, (state) => {
                state.isUpdatingProfile = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                const user = action.payload;
                state.profiles[user.id] = { ...state.profiles[user.id], ...user };
                state.isUpdatingProfile = false;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.error = action.payload;
                state.isUpdatingProfile = false;
            });

        // Follow User
        builder
            .addCase(followUser.fulfilled, (state, action) => {
                const { userId } = action.payload;
                if (state.profiles[userId]) {
                    state.profiles[userId].isFollowing = true;
                    state.profiles[userId].followersCount += 1;
                }
            })
            .addCase(followUser.rejected, (state, action) => {
                // Revert optimistic update
                const userId = action.meta.arg;
                if (state.profiles[userId]) {
                    state.profiles[userId].isFollowing = false;
                    state.profiles[userId].followersCount -= 1;
                }
                state.error = action.payload;
            });

        // Unfollow User
        builder
            .addCase(unfollowUser.fulfilled, (state, action) => {
                const { userId } = action.payload;
                if (state.profiles[userId]) {
                    state.profiles[userId].isFollowing = false;
                    state.profiles[userId].followersCount -= 1;
                }
            })
            .addCase(unfollowUser.rejected, (state, action) => {
                // Revert optimistic update
                const userId = action.meta.arg;
                if (state.profiles[userId]) {
                    state.profiles[userId].isFollowing = true;
                    state.profiles[userId].followersCount += 1;
                }
                state.error = action.payload;
            });

        // Fetch User Posts
        builder
            .addCase(fetchUserPosts.pending, (state) => {
                state.isLoadingPosts = true;
                state.error = null;
            })
            .addCase(fetchUserPosts.fulfilled, (state, action) => {
                const { userId, posts, nextCursor, hasMore } = action.payload;

                if (!state.userPosts[userId]) {
                    state.userPosts[userId] = { postIds: [], nextCursor: null, hasMore: true };
                }

                const postIds = posts.map((p) => p.id);
                state.userPosts[userId].postIds.push(...postIds);
                state.userPosts[userId].nextCursor = nextCursor;
                state.userPosts[userId].hasMore = hasMore;

                state.isLoadingPosts = false;
            })
            .addCase(fetchUserPosts.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoadingPosts = false;
            });
    },
});

export const { optimisticFollow, optimisticUnfollow, clearUserData } = usersSlice.actions;
export default usersSlice.reducer;
