/**
 * Prisma Database Configuration
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

// Create Prisma client with logging configuration
const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ],
    errorFormat: 'pretty',
});

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
    prisma.$on('query', (e) => {
        logger.debug(`Query: ${e.query}`);
        logger.debug(`Params: ${e.params}`);
        logger.debug(`Duration: ${e.duration}ms`);
    });
}

// Log database errors
prisma.$on('error', (e) => {
    logger.error('Database error:', e);
});

// Log database info
prisma.$on('info', (e) => {
    logger.info('Database info:', e.message);
});

// Log database warnings
prisma.$on('warn', (e) => {
    logger.warn('Database warning:', e.message);
});

// Test database connection on startup
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        logger.info('✅ Database connected successfully');

        // Test query to ensure database is working
        await prisma.$queryRaw`SELECT 1`;
        logger.info('✅ Database query test passed');

    } catch (error) {
        logger.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};

// Initialize database connection
connectDatabase();

// Graceful shutdown handler
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        logger.info('✅ Database disconnected successfully');
    } catch (error) {
        logger.error('❌ Database disconnection failed:', error);
    }
};

module.exports = {
    prisma,
    connectDatabase,
    disconnectDatabase
};