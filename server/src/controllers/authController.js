/**
 * Authentication Controller
 * Handles user registration, login, logout, and token refresh
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { redisUtils } = require('../config/redis');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');
const { validateRegister, validateLogin } = require('../utils/validation');

/**
 * Generate JWT access token
 */
const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId, type: 'access' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );
};

/**
 * Generate JWT refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
};

/**
 * Hash password using bcrypt
 */
const hashPassword = async (password) => {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Create user session and cache it
 */
const createUserSession = async (user) => {
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Update refresh token in database
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken }
    });

    // Cache user session in Redis
    await redisUtils.cacheSession(user.id, {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        }
    };
};

/**
 * Register new user
 */
const register = catchAsync(async (req, res) => {
    // Validate input
    const { error, value } = validateRegister(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { email, username, password, firstName, lastName } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: email.toLowerCase() },
                { username: username.toLowerCase() }
            ]
        }
    });

    if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
            throw new ApiError(409, 'Email already registered');
        }
        if (existingUser.username === username.toLowerCase()) {
            throw new ApiError(409, 'Username already taken');
        }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
        data: {
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName
        }
    });

    logger.info(`New user registered: ${user.username} (${user.email})`);

    // Create session
    const sessionData = await createUserSession(user);

    res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: sessionData
    });
});

/**
 * Login user
 */
const login = catchAsync(async (req, res) => {
    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const { identifier, password } = value; // identifier can be email or username

    // Find user by email or username
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: identifier.toLowerCase() },
                { username: identifier.toLowerCase() }
            ]
        }
    });

    if (!user) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }

    logger.info(`User logged in: ${user.username}`);

    // Create session
    const sessionData = await createUserSession(user);

    res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: sessionData
    });
});

/**
 * Refresh access token
 */
const refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token required');
    }

    // Verify refresh token
    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new ApiError(401, 'Invalid refresh token');
    }

    if (decoded.type !== 'refresh') {
        throw new ApiError(401, 'Invalid token type');
    }

    // Find user and verify refresh token
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
    });

    if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError(401, 'Invalid refresh token');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    // Update refresh token in database
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken }
    });

    // Update cached session
    await redisUtils.cacheSession(user.id, {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: user.isVerified
    });

    logger.info(`Token refreshed for user: ${user.username}`);

    res.status(200).json({
        status: 'success',
        message: 'Token refreshed successfully',
        data: {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        }
    });
});

/**
 * Logout user
 */
const logout = catchAsync(async (req, res) => {
    const userId = req.user.id;

    // Remove refresh token from database
    await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null }
    });

    // Remove cached session
    await redisUtils.deleteCachedSession(userId);

    logger.info(`User logged out: ${req.user.username}`);

    res.status(200).json({
        status: 'success',
        message: 'Logout successful'
    });
});

/**
 * Get current user profile
 */
const getMe = catchAsync(async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            bio: true,
            avatar: true,
            isVerified: true,
            createdAt: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json({
        status: 'success',
        data: {
            user: {
                ...user,
                postsCount: user._count.posts,
                followersCount: user._count.followers,
                followingCount: user._count.following
            }
        }
    });
});

/**
 * Change password
 */
const changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
        throw new ApiError(400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
        throw new ApiError(400, 'New password must be at least 6 characters long');
    }

    // Get user with password
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password and invalidate all refresh tokens
    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedNewPassword,
            refreshToken: null
        }
    });

    // Remove cached session to force re-login
    await redisUtils.deleteCachedSession(userId);

    logger.info(`Password changed for user: ${user.username}`);

    res.status(200).json({
        status: 'success',
        message: 'Password changed successfully. Please login again.'
    });
});

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    getMe,
    changePassword
};