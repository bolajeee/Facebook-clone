/**
 * Comment Controller
 */

const { prisma } = require('../config/database');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { createCommentNotification } = require('../services/notificationService');
const { emitCommentToPost } = require('../socket/socketHandlers');

/**
 * Create a comment on a post
 */
const createComment = catchAsync(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const io = req.app.get('io');

    // Check if post exists
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true, authorId: true }
    });

    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    // Create comment
    const comment = await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: userId
        },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            }
        }
    });

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== userId) {
        await createCommentNotification(io, post.authorId, req.user, postId, comment.id);
    }

    // Emit comment to post room
    emitCommentToPost(io, postId, comment);

    logger.info(`Comment created on post ${postId} by ${req.user.username}`);

    res.status(201).json({
        status: 'success',
        message: 'Comment created successfully',
        data: { comment }
    });
});

/**
 * Get comments for a post
 */
const getPostComments = catchAsync(async (req, res) => {
    const { postId } = req.params;
    const { cursor, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit), 50);

    // Check if post exists
    const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { id: true }
    });

    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    // Build query
    const whereClause = { postId };
    if (cursor) {
        whereClause.id = { lt: cursor };
    }

    const comments = await prisma.comment.findMany({
        where: whereClause,
        take: take + 1,
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            }
        }
    });

    const hasMore = comments.length > take;
    const commentsToReturn = hasMore ? comments.slice(0, -1) : comments;

    // Get total comments count
    const commentsCount = await prisma.comment.count({
        where: { postId }
    });

    res.status(200).json({
        status: 'success',
        data: {
            comments: commentsToReturn,
            commentsCount,
            pagination: {
                hasMore,
                nextCursor: hasMore ? commentsToReturn[commentsToReturn.length - 1].id : null
            }
        }
    });
});

/**
 * Update a comment
 */
const updateComment = catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, 'Comment content is required');
    }

    // Check if comment exists and user owns it
    const existingComment = await prisma.comment.findUnique({
        where: { id: commentId }
    });

    if (!existingComment) {
        throw new ApiError(404, 'Comment not found');
    }

    if (existingComment.authorId !== userId) {
        throw new ApiError(403, 'You can only edit your own comments');
    }

    // Update comment
    const comment = await prisma.comment.update({
        where: { id: commentId },
        data: { content },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            }
        }
    });

    logger.info(`Comment updated: ${commentId}`);

    res.status(200).json({
        status: 'success',
        message: 'Comment updated successfully',
        data: { comment }
    });
});

/**
 * Delete a comment
 */
const deleteComment = catchAsync(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: { id: true, authorId: true, postId: true }
    });

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    // Check if user owns the comment or the post
    const post = await prisma.post.findUnique({
        where: { id: comment.postId },
        select: { authorId: true }
    });

    if (comment.authorId !== userId && post.authorId !== userId) {
        throw new ApiError(403, 'You can only delete your own comments or comments on your posts');
    }

    // Delete comment
    await prisma.comment.delete({
        where: { id: commentId }
    });

    logger.info(`Comment deleted: ${commentId}`);

    res.status(200).json({
        status: 'success',
        message: 'Comment deleted successfully'
    });
});

/**
 * Get a single comment
 */
const getComment = catchAsync(async (req, res) => {
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
        where: { id: commentId },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true
                }
            },
            post: {
                select: {
                    id: true,
                    content: true,
                    author: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        }
    });

    if (!comment) {
        throw new ApiError(404, 'Comment not found');
    }

    res.status(200).json({
        status: 'success',
        data: { comment }
    });
});

module.exports = {
    createComment,
    getPostComments,
    updateComment,
    deleteComment,
    getComment
};