/**
 * Posts Routes
 * Handles post creation, feed generation, likes, and comments
 */

const express = require('express');
const router = express.Router();

// Import controllers
const {
    createPost,
    getFeed,
    getPost,
    getUserPosts,
    updatePost,
    deletePost,
    toggleLike,
    getPostLikes
} = require('../controllers/postController');

const {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
    getComment
} = require('../controllers/commentController');

// Import middleware
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateBody, validateQuery } = require('../utils/validation');
const {
    validateCreatePost,
    validateCreateComment,
    validatePagination
} = require('../utils/validation');

// ============ POST ROUTES ============

/**
 * @route   GET /api/posts/feed
 * @desc    Get personalized feed (posts from followed users)
 * @access  Private
 * @query   { cursor?, limit? }
 */
router.get('/feed',
    authenticate,
    validateQuery(validatePagination),
    getFeed
);

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private
 * @body    { content, imageUrl? }
 */
router.post('/',
    authenticate,
    validateBody(validateCreatePost),
    createPost
);

/**
 * @route   GET /api/posts/:postId
 * @desc    Get a single post by ID
 * @access  Public (optional auth for isLiked status)
 */
router.get('/:postId',
    optionalAuth,
    getPost
);

/**
 * @route   GET /api/posts/user/:userId
 * @desc    Get posts by a specific user
 * @access  Public (optional auth for isLiked status)
 * @query   { cursor?, limit? }
 */
router.get('/user/:userId',
    optionalAuth,
    validateQuery(validatePagination),
    getUserPosts
);

/**
 * @route   PUT /api/posts/:postId
 * @desc    Update a post
 * @access  Private (owner only)
 * @body    { content?, imageUrl? }
 */
router.put('/:postId',
    authenticate,
    updatePost
);

/**
 * @route   DELETE /api/posts/:postId
 * @desc    Delete a post
 * @access  Private (owner only)
 */
router.delete('/:postId',
    authenticate,
    deletePost
);

// ============ LIKE ROUTES ============

/**
 * @route   POST /api/posts/:postId/like
 * @desc    Like or unlike a post (toggle)
 * @access  Private
 */
router.post('/:postId/like',
    authenticate,
    toggleLike
);

/**
 * @route   GET /api/posts/:postId/likes
 * @desc    Get users who liked a post
 * @access  Public
 * @query   { cursor?, limit? }
 */
router.get('/:postId/likes',
    validateQuery(validatePagination),
    getPostLikes
);

// ============ COMMENT ROUTES ============

/**
 * @route   POST /api/posts/:postId/comments
 * @desc    Create a comment on a post
 * @access  Private
 * @body    { content }
 */
router.post('/:postId/comments',
    authenticate,
    validateBody(validateCreateComment),
    createComment
);

/**
 * @route   GET /api/posts/:postId/comments
 * @desc    Get comments for a post
 * @access  Public
 * @query   { cursor?, limit? }
 */
router.get('/:postId/comments',
    validateQuery(validatePagination),
    getPostComments
);

/**
 * @route   GET /api/posts/comments/:commentId
 * @desc    Get a single comment
 * @access  Public
 */
router.get('/comments/:commentId',
    getComment
);

/**
 * @route   PUT /api/posts/comments/:commentId
 * @desc    Update a comment
 * @access  Private (owner only)
 * @body    { content }
 */
router.put('/comments/:commentId',
    authenticate,
    updateComment
);

/**
 * @route   DELETE /api/posts/comments/:commentId
 * @desc    Delete a comment
 * @access  Private (owner or post owner)
 */
router.delete('/comments/:commentId',
    authenticate,
    deleteComment
);

module.exports = router;
