/**
 * User Controller
 * Handles user profile operations and follow system
 */

const { prisma } = require('../config/database');
const { redisUtils } = require('../config/redis');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Get user profile by ID
 */
const getUserProfile = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    // Find user with stats
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true,
                },
            },
        },
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: userId,
                },
            },
        });
        isFollowing = !!follow;
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                ...user,
                postsCount: user._count.posts,
                followersCount: user._count.followers,
                followingCount: user._count.following,
                isFollowing,
            },
        },
    });
});

/**
 * Update current user's profile
 */
const updateProfile = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const { firstName, lastName, bio, avatar } = req.body;

    // Build update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
            bio: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
        },
    });

    // Update cached session
    await redisUtils.cacheSession(userId, {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar,
        isVerified: updatedUser.isVerified,
    });

    logger.info(`Profile updated for user: ${updatedUser.username}`);

    res.status(200).json({
        status: 'success',
        message: 'Profile updated successfully',
        data: { user: updatedUser },
    });
});

/**
 * Follow a user
 */
const followUser = catchAsync(async (req, res) => {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    // Can't follow yourself
    if (followerId === followingId) {
        throw new ApiError(400, 'You cannot follow yourself');
    }

    // Check if user exists
    const userToFollow = await prisma.user.findUnique({
        where: { id: followingId },
    });

    if (!userToFollow) {
        throw new ApiError(404, 'User not found');
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });

    if (existingFollow) {
        throw new ApiError(400, 'You are already following this user');
    }

    // Create follow relationship
    await prisma.follow.create({
        data: {
            followerId,
            followingId,
        },
    });

    // TODO: Create notification for the followed user (Phase 10)
    // await notificationService.createNotification({
    //     userId: followingId,
    //     type: 'FOLLOW',
    //     actorId: followerId,
    // });

    logger.info(`User ${req.user.username} followed user ${userToFollow.username}`);

    res.status(200).json({
        status: 'success',
        message: 'User followed successfully',
    });
});

/**
 * Unfollow a user
 */
const unfollowUser = catchAsync(async (req, res) => {
    const followerId = req.user.id;
    const { userId: followingId } = req.params;

    // Check if follow relationship exists
    const existingFollow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });

    if (!existingFollow) {
        throw new ApiError(400, 'You are not following this user');
    }

    // Delete follow relationship
    await prisma.follow.delete({
        where: {
            followerId_followingId: {
                followerId,
                followingId,
            },
        },
    });

    logger.info(`User ${req.user.username} unfollowed user ID: ${followingId}`);

    res.status(200).json({
        status: 'success',
        message: 'User unfollowed successfully',
    });
});

/**
 * Get user's followers
 */
const getFollowers = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { cursor, limit = 20 } = req.query;

    const followers = await prisma.follow.findMany({
        where: { followingId: userId },
        take: parseInt(limit) + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
        include: {
            follower: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    isVerified: true,
                },
            },
        },
    });

    const hasMore = followers.length > parseInt(limit);
    const results = hasMore ? followers.slice(0, -1) : followers;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    res.status(200).json({
        status: 'success',
        data: {
            followers: results.map((f) => f.follower),
            nextCursor,
            hasMore,
        },
    });
});

/**
 * Get user's following
 */
const getFollowing = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { cursor, limit = 20 } = req.query;

    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        take: parseInt(limit) + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
        include: {
            following: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    isVerified: true,
                },
            },
        },
    });

    const hasMore = following.length > parseInt(limit);
    const results = hasMore ? following.slice(0, -1) : following;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    res.status(200).json({
        status: 'success',
        data: {
            following: results.map((f) => f.following),
            nextCursor,
            hasMore,
        },
    });
});

/**
 * Get user's posts
 */
const getUserPosts = catchAsync(async (req, res) => {
    const { userId } = req.params;
    const { cursor, limit = 10 } = req.query;
    const currentUserId = req.user?.id;

    const posts = await prisma.post.findMany({
        where: { authorId: userId },
        take: parseInt(limit) + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
        include: {
            author: {
                select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                    isVerified: true,
                },
            },
            _count: {
                select: {
                    likes: true,
                    comments: true,
                },
            },
            ...(currentUserId && {
                likes: {
                    where: { userId: currentUserId },
                    select: { id: true },
                },
            }),
        },
    });

    const hasMore = posts.length > parseInt(limit);
    const results = hasMore ? posts.slice(0, -1) : posts;
    const nextCursor = hasMore ? results[results.length - 1].id : null;

    // Format posts
    const formattedPosts = results.map((post) => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.author,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLikedByUser: currentUserId ? post.likes.length > 0 : false,
    }));

    res.status(200).json({
        status: 'success',
        data: {
            posts: formattedPosts,
            nextCursor,
            hasMore,
        },
    });
});

module.exports = {
    getUserProfile,
    updateProfile,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    getUserPosts,
};
