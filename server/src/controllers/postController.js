/**
 * Post Controller
 * Handles post creation, feed generation, likes, and comments
 */

const { prisma } = require('../config/database');
const { redisUtils } = require('../config/redis');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { createLikeNotification } = require('../services/notificationService');
const {
    emitCommentToPost,
    emitLikeToPost
} = require('../socket/socketHandlers');

/**
 * Create a new post
 */
const createPost = catchAsync(async (req, res) => {
    const { content, imageUrl } = req.body;
    const userId = req.user.id;

    // Create post
    const post = await prisma.post.create({
        data: {
            content,
            imageUrl: imageUrl || null,
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
            },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        }
    });

    // Invalidate feed cache for all followers
    const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true }
    });

    for (const follower of followers) {
        await redisUtils.invalidatePattern(`feed:${follower.followerId}`);
    }

    logger.info(`Post created by ${req.user.username}: ${post.id}`);

    res.status(201).json({
        status: 'success',
        message: 'Post created successfully',
        data: {
            post: {
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                isLiked: false
            }
        }
    });
});

/**
 * Get user feed with cursor pagination
 * Shows posts from users the current user follows
 */
const getFeed = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { cursor, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit), 50); // Max 50 posts per request

    // Try to get cached feed (only for first page)
    if (!cursor) {
        const cachedFeed = await redisUtils.getCachedFeed(userId);
        if (cachedFeed) {
            logger.debug(`Feed cache hit for user ${userId}`);
            return res.status(200).json({
                status: 'success',
                data: cachedFeed,
                cached: true
            });
        }
    }

    // Get list of users the current user follows
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);

    // Include user's own posts in feed
    followingIds.push(userId);

    // Build query with cursor pagination
    const whereClause = {
        authorId: { in: followingIds }
    };

    if (cursor) {
        whereClause.id = { lt: cursor }; // Get posts before cursor
    }

    // Fetch posts
    const posts = await prisma.post.findMany({
        where: whereClause,
        take: take + 1, // Fetch one extra to determine if there are more
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
            },
            likes: {
                where: { userId },
                select: { id: true }
            },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        }
    });

    // Check if there are more posts
    const hasMore = posts.length > take;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;

    // Format posts
    const formattedPosts = postsToReturn.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLiked: post.likes.length > 0
    }));

    const response = {
        posts: formattedPosts,
        pagination: {
            hasMore,
            nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null
        }
    };

    // Cache first page of feed for 5 minutes
    if (!cursor) {
        await redisUtils.cacheFeed(userId, response);
    }

    logger.debug(`Feed fetched for user ${userId}: ${formattedPosts.length} posts`);

    res.status(200).json({
        status: 'success',
        data: response
    });
});

/**
 * Get a single post by ID
 */
const getPost = catchAsync(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user?.id;

    const post = await prisma.post.findUnique({
        where: { id: postId },
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
            likes: userId ? {
                where: { userId },
                select: { id: true }
            } : false,
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        }
    });

    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    res.status(200).json({
        status: 'success',
        data: {
            post: {
                ...post,
                likesCount: post._count.likes,
                commentsCount: post._count.comments,
                isLiked: userId ? post.likes.length > 0 : false
            }
        }
    });
});

/**
 * Get posts by a specific user
 */
const getUserPosts = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?.id;
    const { cursor, limit = 20 } = req.query;
    const take = Math.min(parseInt(limit), 50);

    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Build query
    const whereClause = { authorId: userId };
    if (cursor) {
        whereClause.id = { lt: cursor };
    }

    const posts = await prisma.post.findMany({
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
            },
            likes: currentUserId ? {
                where: { userId: currentUserId },
                select: { id: true }
            } : false,
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        }
    });

    const hasMore = posts.length > take;
    const postsToReturn = hasMore ? posts.slice(0, -1) : posts;

    const formattedPosts = postsToReturn.map(post => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        author: post.author,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLiked: currentUserId ? post.likes.length > 0 : false
    }));

    res.status(200).json({
        status: 'success',
        data: {
            posts: formattedPosts,
            pagination: {
                hasMore,
                nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].id : null
            }
        }
    });
});

/**
 * Update a post
 */
const updatePost = catchAsync(async (req, res) => {
    const { postId } = req.params;
    const { content, imageUrl } = req.body;
    const userId = req.user.id;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!existingPost) {
        throw new ApiError(404, 'Post not found');
    }

    if (existingPost.authorId !== userId) {
        throw new ApiError(403, 'You can only edit your own posts');
    }

    // Update post
    const post = await prisma.post.update({
        where: { id: postId },
        data: {
            content: content || existingPost.content,
            imageUrl: imageUrl !== undefined ? imageUrl : existingPost.imageUrl
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
            },
            _count: {
                select: {
                    likes: true,
                    comments: true
                }
            }
        }
    });

    logger.info(`Post updated: ${postId}`);

    res.status(200).json({
        status: 'success',
        message: 'Post updated successfully',
        data: { post }
    });
});

/**
 * Delete a post
 */
const deletePost = catchAsync(async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if post exists and user owns it
    const post = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!post) {
        throw new ApiError(404, 'Post not found');
    }

    if (post.authorId !== userId) {
        throw new ApiError(403, 'You can only delete your own posts');
    }

    // Delete post (cascade will handle comments, likes, notifications)
    await prisma.post.delete({
        where: { id: postId }
    });

    // Invalidate feed cache
    await redisUtils.invalidatePattern(`feed:*`);

    logger.info(`Post deleted: ${postId}`);

    res.status(200).json({
        status: 'success',
        message: 'Post deleted successfully'
    });
});

/**
 * Like or unlike a post
 */
const toggleLike = catchAsync(async (req, res) => {
    const { postId } = req.params;
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

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
        where: {
            postId_userId: {
                postId,
                userId
            }
        }
    });

    let isLiked;
    let likesCount;

    if (existingLike) {
        // Unlike
        await prisma.like.delete({
            where: { id: existingLike.id }
        });
        isLiked = false;

        // Get updated count
        likesCount = await prisma.like.count({
            where: { postId }
        });

        logger.info(`Post unliked: ${postId} by ${req.user.username}`);
    } else {
        // Like
        const like = await prisma.like.create({
            data: {
                postId,
                userId
            }
        });
        isLiked = true;

        // Get updated count
        likesCount = await prisma.like.count({
            where: { postId }
        });

        // Create notification for post author (if not liking own post)
        if (post.authorId !== userId) {
            await createLikeNotification(io, post.authorId, req.user, postId, like.id);
        }

        // Emit like to post room
        emitLikeToPost(io, postId, {
            userId,
            username: req.user.username,
            likesCount
        });

        logger.info(`Post liked: ${postId} by ${req.user.username}`);
    }

    // Cache likes count
    await redisUtils.cacheLikesCount(postId, likesCount);

    res.status(200).json({
        status: 'success',
        message: isLiked ? 'Post liked' : 'Post unliked',
        data: {
            isLiked,
            likesCount
        }
    });
});

/**
 * Get post likes
 */
const getPostLikes = catchAsync(async (req, res) => {
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

    // Try to get cached count
    let likesCount = await redisUtils.getCachedLikesCount(postId);
    if (!likesCount) {
        likesCount = await prisma.like.count({ where: { postId } });
        await redisUtils.cacheLikesCount(postId, likesCount);
    }

    // Build query
    const whereClause = { postId };
    if (cursor) {
        whereClause.id = { lt: cursor };
    }

    const likes = await prisma.like.findMany({
        where: whereClause,
        take: take + 1,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
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

    const hasMore = likes.length > take;
    const likesToReturn = hasMore ? likes.slice(0, -1) : likes;

    res.status(200).json({
        status: 'success',
        data: {
            likes: likesToReturn.map(like => ({
                id: like.id,
                user: like.user,
                createdAt: like.createdAt
            })),
            likesCount,
            pagination: {
                hasMore,
                nextCursor: hasMore ? likesToReturn[likesToReturn.length - 1].id : null
            }
        }
    });
});

module.exports = {
    createPost,
    getFeed,
    getPost,
    getUserPosts,
    updatePost,
    deletePost,
    toggleLike,
    getPostLikes
};