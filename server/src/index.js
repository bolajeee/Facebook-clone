/**
 * Main server entry point
 * Sets up Express app with all middleware, database connections, and Socket.io
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import of custom modules
const { prisma } = require('./config/database');
const { redis } = require('./config/redis');
const { setupSocketHandlers } = require('./socket/socketHandlers');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import of routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = createServer(app);

// Socket.io setup with CORS
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // For image uploads
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        // Check Redis connection
        await redis.ping();

        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                database: 'connected',
                redis: 'connected',
                server: 'running'
            }
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Global error handler (must be last)
app.use(errorHandler);

// Setup Socket.io event handlers
setupSocketHandlers(io);

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');

    server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await prisma.$disconnect();
        logger.info('Database connection closed');

        // Close Redis connection
        await redis.quit();
        logger.info('Redis connection closed');

        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');

    server.close(async () => {
        logger.info('HTTP server closed');

        // Close database connection
        await prisma.$disconnect();
        logger.info('Database connection closed');

        // Close Redis connection
        await redis.quit();
        logger.info('Redis connection closed');

        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📊 Health check available at http://localhost:${PORT}/health`);
    logger.info(`🔌 Socket.io server ready for connections`);
});