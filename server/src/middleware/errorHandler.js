/**
 * Global Error Handler Middleware
 */

const logger = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

/**
 * Handle Prisma errors and convert to API errors
 */
const handlePrismaError = (error) => {
    switch (error.code) {
        case 'P2002':
            // Unique constraint violation
            const field = error.meta?.target?.[0] || 'field';
            return new ApiError(409, `${field} already exists`);

        case 'P2025':
            // Record not found
            return new ApiError(404, 'Record not found');

        case 'P2003':
            // Foreign key constraint violation
            return new ApiError(400, 'Invalid reference to related record');

        case 'P2014':
            // Required relation violation
            return new ApiError(400, 'Required relation is missing');

        case 'P2021':
            // Table does not exist
            return new ApiError(500, 'Database table not found');

        case 'P2022':
            // Column does not exist
            return new ApiError(500, 'Database column not found');

        default:
            return new ApiError(500, 'Database operation failed');
    }
};

/**
 * Handle JWT errors
 */
const handleJWTError = (error) => {
    if (error.name === 'JsonWebTokenError') {
        return new ApiError(401, 'Invalid authentication token');
    }

    if (error.name === 'TokenExpiredError') {
        return new ApiError(401, 'Authentication token expired');
    }

    if (error.name === 'NotBeforeError') {
        return new ApiError(401, 'Authentication token not active');
    }

    return new ApiError(401, 'Authentication failed');
};

/**
 * Handle validation errors
 */
const handleValidationError = (error) => {
    const errors = Object.values(error.errors).map(err => err.message);
    return new ApiError(400, `Validation Error: ${errors.join(', ')}`);
};

/**
 * Send error response in development
 */
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: 'error',
        error: err,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
    });
};

/**
 * Send error response in production
 */
const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            timestamp: new Date().toISOString()
        });
    } else {
        // Programming or other unknown error: don't leak error details
        logger.error('ERROR:', err);

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong!',
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;

    // Log error details
    logger.error(`Error ${error.statusCode}: ${error.message}`, {
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        stack: err.stack
    });

    // Handle specific error types
    if (err.name === 'PrismaClientKnownRequestError') {
        error = handlePrismaError(err);
    } else if (err.name === 'PrismaClientValidationError') {
        error = new ApiError(400, 'Invalid data provided');
    } else if (err.name === 'JsonWebTokenError' ||
        err.name === 'TokenExpiredError' ||
        err.name === 'NotBeforeError') {
        error = handleJWTError(err);
    } else if (err.name === 'ValidationError') {
        error = handleValidationError(err);
    } else if (err.name === 'CastError') {
        error = new ApiError(400, 'Invalid ID format');
    } else if (err.code === 11000) {
        // MongoDB duplicate key error
        const field = Object.keys(err.keyValue)[0];
        error = new ApiError(409, `${field} already exists`);
    } else if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            error = new ApiError(400, 'File too large');
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            error = new ApiError(400, 'Too many files');
        } else {
            error = new ApiError(400, 'File upload error');
        }
    }

    // Send error response
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, res);
    } else {
        sendErrorProd(error, res);
    }
};

/**
 * Handle async errors - wrapper function
 */
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

/**
 * Handle 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
    const error = new ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};

module.exports = {
    ApiError,
    errorHandler,
    catchAsync,
    notFound
};