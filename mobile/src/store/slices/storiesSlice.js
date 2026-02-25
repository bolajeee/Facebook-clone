import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Async thunks
 */
export const fetchStories = createAsyncThunk(
    'stories/fetchStories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/stories`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch stories');
        }
    }
);

export const createStory = createAsyncThunk(
    'stories/createStory',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/stories`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create story');
        }
    }
);

/**
 * Stories Slice
 * 
 * Manages:
 * - Stories list (user stories with metadata)
 * - Current user's story
 * - Story viewing state
 */
const storiesSlice = createSlice({
    name: 'stories',
    initialState: {
        allStories: [], // All stories from following users
        userStories: {}, // Grouped by userId: { userId: [stories] }
        currentStory: null,
        isLoadingStories: false,
        isCreatingStory: false,
        error: null,
    },
    reducers: {
        setCurrentStory: (state, action) => {
            state.currentStory = action.payload;
        },
        clearCurrentStory: (state) => {
            state.currentStory = null;
        },
        markStoryAsViewed: (state, action) => {
            const { storyId, userId } = action.payload;
            if (state.userStories[userId]) {
                const story = state.userStories[userId].find((s) => s.id === storyId);
                if (story) {
                    story.isViewed = true;
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch stories
            .addCase(fetchStories.pending, (state) => {
                state.isLoadingStories = true;
                state.error = null;
            })
            .addCase(fetchStories.fulfilled, (state, action) => {
                state.isLoadingStories = false;
                state.allStories = action.payload;
                // Group stories by userId
                const grouped = {};
                action.payload.forEach((story) => {
                    if (!grouped[story.userId]) {
                        grouped[story.userId] = [];
                    }
                    grouped[story.userId].push(story);
                });
                state.userStories = grouped;
            })
            .addCase(fetchStories.rejected, (state, action) => {
                state.isLoadingStories = false;
                state.error = action.payload;
            })
            // Create story
            .addCase(createStory.pending, (state) => {
                state.isCreatingStory = true;
                state.error = null;
            })
            .addCase(createStory.fulfilled, (state, action) => {
                state.isCreatingStory = false;
                const userId = action.payload.userId;
                if (!state.userStories[userId]) {
                    state.userStories[userId] = [];
                }
                state.userStories[userId].unshift(action.payload);
                state.allStories.unshift(action.payload);
            })
            .addCase(createStory.rejected, (state, action) => {
                state.isCreatingStory = false;
                state.error = action.payload;
            });
    },
});

export const { setCurrentStory, clearCurrentStory, markStoryAsViewed } = storiesSlice.actions;
export default storiesSlice.reducer;
