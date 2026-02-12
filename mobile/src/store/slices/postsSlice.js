import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { postsAPI } from '../../api/posts';

/**
 * Posts Slice
 * 
 * Manages feed posts with:
 * - Normalized state (posts stored by ID)
 * - Cursor pagination
 * - Optimistic updates for likes
 * - Loading states
 */

// Fetch feed posts
export const fetchFeed = createAsyncThunk(
    'posts/fetchFeed',
    async ({ cursor = null, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await postsAPI.getFeed(cursor, limit);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch feed'
            );
        }
    }
);

// Create a new post
export const createPost = createAsyncThunk(
    'posts/createPost',
    async (postData, { rejectWithValue }) => {
        try {
            const response = await postsAPI.createPost(postData);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create post'
            );
        }
    }
);

// Like a post
export const likePost = createAsyncThunk(
    'posts/likePost',
    async (postId, { rejectWithValue, getState }) => {
        try {
            const userId = getState().auth.user.id;
            const response = await postsAPI.likePost(postId);
            return { postId, userId, like: response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to like post'
            );
        }
    }
);

// Unlike a post
export const unlikePost = createAsyncThunk(
    'posts/unlikePost',
    async (postId, { rejectWithValue, getState }) => {
        try {
            const userId = getState().auth.user.id;
            await postsAPI.unlikePost(postId);
            return { postId, userId };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to unlike post'
            );
        }
    }
);

const postsSlice = createSlice({
    name: 'posts',
    initialState: {
        // Normalized state: posts stored by ID for efficient updates
        byId: {}, // { postId: postObject }
        allIds: [], // [postId1, postId2, ...]

        // Pagination
        hasMore: true,
        nextCursor: null,

        // Loading states
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,

        error: null,
    },
    reducers: {
        // Optimistic like update (before API call completes)
        optimisticLike: (state, action) => {
            const { postId, userId } = action.payload;
            const post = state.byId[postId];
            if (post) {
                post.likesCount += 1;
                post.isLikedByUser = true;
            }
        },

        // Optimistic unlike update
        optimisticUnlike: (state, action) => {
            const { postId, userId } = action.payload;
            const post = state.byId[postId];
            if (post) {
                post.likesCount -= 1;
                post.isLikedByUser = false;
            }
        },

        // Add a new post to the top (for real-time updates or after creation)
        prependPost: (state, action) => {
            const post = action.payload;
            state.byId[post.id] = post;
            state.allIds.unshift(post.id);
        },

        // Clear feed (for refresh)
        clearFeed: (state) => {
            state.byId = {};
            state.allIds = [];
            state.nextCursor = null;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        // Fetch Feed
        builder
            .addCase(fetchFeed.pending, (state, action) => {
                // Determine loading type based on whether we have a cursor
                if (action.meta.arg.cursor) {
                    state.isLoadingMore = true;
                } else {
                    state.isLoading = true;
                }
                state.error = null;
            })
            .addCase(fetchFeed.fulfilled, (state, action) => {
                const { posts, nextCursor, hasMore } = action.payload;

                // Add posts to normalized state
                posts.forEach((post) => {
                    state.byId[post.id] = post;
                    if (!state.allIds.includes(post.id)) {
                        state.allIds.push(post.id);
                    }
                });

                state.nextCursor = nextCursor;
                state.hasMore = hasMore;
                state.isLoading = false;
                state.isLoadingMore = false;
                state.isRefreshing = false;
            })
            .addCase(fetchFeed.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
                state.isLoadingMore = false;
                state.isRefreshing = false;
            });

        // Create Post
        builder
            .addCase(createPost.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                const post = action.payload;
                state.byId[post.id] = post;
                state.allIds.unshift(post.id);
                state.isLoading = false;
            })
            .addCase(createPost.rejected, (state, action) => {
                state.error = action.payload;
                state.isLoading = false;
            });

        // Like Post
        builder
            .addCase(likePost.fulfilled, (state, action) => {
                const { postId, like } = action.payload;
                const post = state.byId[postId];
                if (post) {
                    post.isLikedByUser = true;
                    // Update with actual data from server
                    post.likesCount = like.post.likesCount;
                }
            })
            .addCase(likePost.rejected, (state, action) => {
                // Revert optimistic update on error
                const postId = action.meta.arg;
                const post = state.byId[postId];
                if (post) {
                    post.likesCount -= 1;
                    post.isLikedByUser = false;
                }
            });

        // Unlike Post
        builder
            .addCase(unlikePost.fulfilled, (state, action) => {
                const { postId } = action.payload;
                const post = state.byId[postId];
                if (post) {
                    post.isLikedByUser = false;
                }
            })
            .addCase(unlikePost.rejected, (state, action) => {
                // Revert optimistic update on error
                const postId = action.meta.arg;
                const post = state.byId[postId];
                if (post) {
                    post.likesCount += 1;
                    post.isLikedByUser = true;
                }
            });
    },
});

export const { optimisticLike, optimisticUnlike, prependPost, clearFeed } = postsSlice.actions;
export default postsSlice.reducer;
