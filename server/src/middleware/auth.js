/**
 * JWT Authentication Middleware
 * Protects routes and validates JWT tokens
 */

const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { redisUtils } = require('../config/redis');
const { ApiError, catchAsync } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT tokens
 */
const authenticate = catchAsync(async (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Access token expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new ApiError(401, 'Invalid access token');
        }
        throw new ApiError(401, 'Token verification failed');
    }

    // Check token type
    if (decoded.type !== 'access') {
        throw new ApiError(401, 'Invalid token type');
    }

    // Try to get user from cache first
    let user = await redisUtils.getCachedSession(decoded.userId);

    if (!user) {
        // If not in cache, get from database
        user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
                isVerified: true,
                refreshToken: true
            }
        });

        if (!user) {
            throw new ApiError(401, 'User not found');
        }

        // Cache user session
        await redisUtils.cacheSession(user.id, {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            isVerified: user.isVerified
        });
    }

    // Check if user still has a valid refresh token (not logged out)
    if (!user.refreshToken) {
        const dbUser = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { refreshToken: true }
        });

        if (!dbUser?.refreshToken) {
            throw new ApiError(401, 'User session expired. Please login again.');
        }
    }

    // Attach user to request
    req.user = user;

    logger.debug(`Authenticated user: ${user.username}`);
    next();
});

/**
 * Middleware to check if user is verified (optional feature)
 */
const requireVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        throw new ApiError(403, 'Account verification required');
    }
    next();
};

/**
 * Middleware for optional authentication
 * Attaches user if token is valid, but doesn't throw error if not
 */
const optionalAuth = catchAsync(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type === 'access') {
            // Try to get user from cache
            let user = await redisUtils.getCachedSession(decoded.userId);

            if (!user) {
                user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        isVerified: true
                    }
                });

                if (user) {
                    await redisUtils.cacheSession(user.id, user);
                }
            }

            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently fail for optional auth
        logger.debug('Optional auth failed:', error.message);
    }

    next();
});

/**
 * Rate limiting middleware for auth endpoints
 */
const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();

    return (req, res, next) => {
        const key = req.ip;
        const now = Date.now();

        // Clean old attempts
        for (const [ip, data] of attempts.entries()) {
            if (now - data.firstAttempt > windowMs) {
                attempts.delete(ip);
            }
        }

        const userAttempts = attempts.get(key);

        if (!userAttempts) {
            attempts.set(key, {
                count: 1,
                firstAttempt: now
            });
            return next();
        }

        if (userAttempts.count >= maxAttempts) {
            const timeLeft = Math.ceil((windowMs - (now - userAttempts.firstAttempt)) / 1000 / 60);
            throw new ApiError(429, `Too many authentication attempts. Try again in ${timeLeft} minutes.`);
        }

        userAttempts.count++;
        next();
    };
};

/**
 * Middleware to validate user owns resource
 */
const requireOwnership = (resourceIdParam = 'id', resourceType = 'post') => {
    return catchAsync(async (req, res, next) => {
        const resourceId = req.params[resourceIdParam];
        const userId = req.user.id;

        let resource;

        switch (resourceType) {
            case 'post':
                resource = await prisma.post.findUnique({
                    where: { id: resourceId },
                    select: { authorId: true }
                });
                break;
            case 'comment':
                resource = await prisma.comment.findUnique({
                    where: { id: resourceId },
                    select: { authorId: true }
                });
                break;
            default:
                throw new ApiError(500, 'Invalid resource type');
        }

        if (!resource) {
            throw new ApiError(404, `${resourceType} not found`);
        }

        if (resource.authorId !== userId) {
            throw new ApiError(403, `You don't have permission to modify this ${resourceType}`);
        }

        next();
    });
};

module.exports = {
    authenticate,
    requireVerified,
    optionalAuth,
    authRateLimit,
    requireOwnership
};