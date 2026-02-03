/**
 * Redis Configuration
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: process.env.REDIS_DB || 0,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
    logger.info('✅ Redis connected successfully');
});

redis.on('ready', () => {
    logger.info('✅ Redis ready for commands');
});

redis.on('error', (error) => {
    logger.error('❌ Redis connection error:', error);
});

redis.on('close', () => {
    logger.warn('⚠️ Redis connection closed');
});

redis.on('reconnecting', (delay) => {
    logger.info(`🔄 Redis reconnecting in ${delay}ms`);
});

redis.on('end', () => {
    logger.info('🔚 Redis connection ended');
});

// Test Redis connection
const connectRedis = async () => {
    try {
        await redis.connect();

        // Test Redis with a ping
        const ping = await redis.ping();
        if (ping === 'PING') {
            logger.info('✅ Redis ping test passed');
        }

        // Set Redis key expiration for sessions (7 days)
        await redis.config('SET', 'maxmemory-policy', 'allkeys-lru');

    } catch (error) {
        logger.error('❌ Redis connection failed:', error);
        // Don't exit process - app can work without Redis, just slower
        logger.warn('⚠️ Continuing without Redis - caching disabled');
    }
};

// Initialize Redis connection
connectRedis();

// Redis utility functions for common operations
const redisUtils = {
    // Cache user feed for 5 minutes
    async cacheFeed(userId, posts) {
        try {
            const key = `feed:${userId}`;
            await redis.setex(key, 300, JSON.stringify(posts)); // 5 minutes
            logger.debug(`Feed cached for user ${userId}`);
        } catch (error) {
            logger.error('Failed to cache feed:', error);
        }
    },

    // Get cached user feed
    async getCachedFeed(userId) {
        try {
            const key = `feed:${userId}`;
            const cached = await redis.get(key);
            if (cached) {
                logger.debug(`Feed cache hit for user ${userId}`);
                return JSON.parse(cached);
            }
            logger.debug(`Feed cache miss for user ${userId}`);
            return null;
        } catch (error) {
            logger.error('Failed to get cached feed:', error);
            return null;
        }
    },

    // Cache user session
    async cacheSession(userId, sessionData) {
        try {
            const key = `session:${userId}`;
            await redis.setex(key, 604800, JSON.stringify(sessionData)); // 7 days
            logger.debug(`Session cached for user ${userId}`);
        } catch (error) {
            logger.error('Failed to cache session:', error);
        }
    },

    // Get cached user session
    async getCachedSession(userId) {
        try {
            const key = `session:${userId}`;
            const cached = await redis.get(key);
            if (cached) {
                logger.debug(`Session cache hit for user ${userId}`);
                return JSON.parse(cached);
            }
            return null;
        } catch (error) {
            logger.error('Failed to get cached session:', error);
            return null;
        }
    },

    // Delete cached session
    async deleteCachedSession(userId) {
        try {
            const key = `session:${userId}`;
            await redis.del(key);
            logger.debug(`Session cache deleted for user ${userId}`);
        } catch (error) {
            logger.error('Failed to delete cached session:', error);
        }
    },

    // Cache post likes count
    async cacheLikesCount(postId, count) {
        try {
            const key = `likes:${postId}`;
            await redis.setex(key, 60, count.toString()); // 1 minute
        } catch (error) {
            logger.error('Failed to cache likes count:', error);
        }
    },

    // Get cached likes count
    async getCachedLikesCount(postId) {
        try {
            const key = `likes:${postId}`;
            const cached = await redis.get(key);
            return cached ? parseInt(cached) : null;
        } catch (error) {
            logger.error('Failed to get cached likes count:', error);
            return null;
        }
    },

    // Invalidate cache patterns
    async invalidatePattern(pattern) {
        try {
            const keys = await redis.keys(pattern);
            if (keys.length > 0) {
                await redis.del(...keys);
                logger.debug(`Invalidated ${keys.length} cache keys matching ${pattern}`);
            }
        } catch (error) {
            logger.error('Failed to invalidate cache pattern:', error);
        }
    }
};

// Graceful shutdown
const disconnectRedis = async () => {
    try {
        await redis.quit();
        logger.info('✅ Redis disconnected successfully');
    } catch (error) {
        logger.error('❌ Redis disconnection failed:', error);
    }
};

module.exports = {
    redis,
    redisUtils,
    connectRedis,
    disconnectRedis
};