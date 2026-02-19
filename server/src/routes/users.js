/**
 * User Routes
 * Handles user profile operations and follow system
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getUserPosts,
} = require('../controllers/userController');

// Public routes (optional auth - shows different data if authenticated)
router.get('/profile/:userId', authenticate, getUserProfile);
router.get('/:userId/posts', authenticate, getUserPosts);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

// Protected routes (require authentication)
router.put('/profile', authenticate, updateProfile);
router.post('/follow/:userId', authenticate, followUser);
router.delete('/follow/:userId', authenticate, unfollowUser);

module.exports = router;