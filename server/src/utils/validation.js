/**
 * Input Validation Utilities
 * Uses Joi for comprehensive input validation
 */

const Joi = require('joi');

/**
 * Common validation schemas
 */
const schemas = {
    // Email validation
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .max(255)
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required',
            'string.max': 'Email must not exceed 255 characters'
        }),

    // Username validation
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .lowercase()
        .required()
        .messages({
            'string.alphanum': 'Username can only contain letters and numbers',
            'string.min': 'Username must be at least 3 characters long',
            'string.max': 'Username must not exceed 30 characters',
            'string.empty': 'Username is required'
        }),

    // Password validation
    password: Joi.string()
        .min(6)
        .max(128)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'string.max': 'Password must not exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'string.empty': 'Password is required'
        }),

    // Name validation
    name: Joi.string()
        .min(1)
        .max(50)
        .pattern(new RegExp('^[a-zA-Z\\s]+$'))
        .trim()
        .required()
        .messages({
            'string.min': 'Name must be at least 1 character long',
            'string.max': 'Name must not exceed 50 characters',
            'string.pattern.base': 'Name can only contain letters and spaces',
            'string.empty': 'Name is required'
        }),

    // Bio validation
    bio: Joi.string()
        .max(500)
        .trim()
        .allow('')
        .messages({
            'string.max': 'Bio must not exceed 500 characters'
        }),

    // Post content validation
    postContent: Joi.string()
        .min(1)
        .max(2000)
        .trim()
        .required()
        .messages({
            'string.min': 'Post content cannot be empty',
            'string.max': 'Post content must not exceed 2000 characters',
            'string.empty': 'Post content is required'
        }),

    // Comment content validation
    commentContent: Joi.string()
        .min(1)
        .max(500)
        .trim()
        .required()
        .messages({
            'string.min': 'Comment cannot be empty',
            'string.max': 'Comment must not exceed 500 characters',
            'string.empty': 'Comment is required'
        }),

    // ID validation (CUID)
    id: Joi.string()
        .pattern(new RegExp('^c[a-z0-9]{24}$'))
        .required()
        .messages({
            'string.pattern.base': 'Invalid ID format',
            'string.empty': 'ID is required'
        }),

    // Pagination validation
    cursor: Joi.string()
        .pattern(new RegExp('^c[a-z0-9]{24}$'))
        .optional()
        .messages({
            'string.pattern.base': 'Invalid cursor format'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(50)
        .default(20)
        .messages({
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit must not exceed 50',
            'number.integer': 'Limit must be an integer'
        })
};

/**
 * User registration validation
 */
const validateRegister = (data) => {
    const schema = Joi.object({
        email: schemas.email,
        username: schemas.username,
        password: schemas.password,
        firstName: schemas.name,
        lastName: schemas.name
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * User login validation
 */
const validateLogin = (data) => {
    const schema = Joi.object({
        identifier: Joi.string()
            .min(3)
            .max(255)
            .required()
            .messages({
                'string.min': 'Email or username must be at least 3 characters long',
                'string.max': 'Email or username must not exceed 255 characters',
                'string.empty': 'Email or username is required'
            }),
        password: Joi.string()
            .min(1)
            .required()
            .messages({
                'string.empty': 'Password is required'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Profile update validation
 */
const validateProfileUpdate = (data) => {
    const schema = Joi.object({
        firstName: schemas.name.optional(),
        lastName: schemas.name.optional(),
        bio: schemas.bio,
        username: schemas.username.optional()
    }).min(1); // At least one field must be provided

    return schema.validate(data, { abortEarly: false });
};

/**
 * Post creation validation
 */
const validateCreatePost = (data) => {
    const schema = Joi.object({
        content: schemas.postContent,
        imageUrl: Joi.string()
            .uri()
            .optional()
            .messages({
                'string.uri': 'Image URL must be a valid URL'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Comment creation validation
 */
const validateCreateComment = (data) => {
    const schema = Joi.object({
        content: schemas.commentContent,
        postId: schemas.id
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Pagination validation
 */
const validatePagination = (data) => {
    const schema = Joi.object({
        cursor: schemas.cursor,
        limit: schemas.limit
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Password change validation
 */
const validatePasswordChange = (data) => {
    const schema = Joi.object({
        currentPassword: Joi.string()
            .required()
            .messages({
                'string.empty': 'Current password is required'
            }),
        newPassword: schemas.password
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Search query validation
 */
const validateSearch = (data) => {
    const schema = Joi.object({
        query: Joi.string()
            .min(1)
            .max(100)
            .trim()
            .required()
            .messages({
                'string.min': 'Search query cannot be empty',
                'string.max': 'Search query must not exceed 100 characters',
                'string.empty': 'Search query is required'
            }),
        type: Joi.string()
            .valid('users', 'posts', 'all')
            .default('all')
            .messages({
                'any.only': 'Search type must be users, posts, or all'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Notification update validation
 */
const validateNotificationUpdate = (data) => {
    const schema = Joi.object({
        isRead: Joi.boolean()
            .required()
            .messages({
                'boolean.base': 'isRead must be a boolean value',
                'any.required': 'isRead is required'
            })
    });

    return schema.validate(data, { abortEarly: false });
};

/**
 * Generic ID parameter validation
 */
const validateIdParam = (id) => {
    return schemas.id.validate(id);
};

/**
 * File upload validation
 */
const validateFileUpload = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
        return { error: { message: 'File is required' } };
    }

    if (!allowedTypes.includes(file.mimetype)) {
        return { error: { message: 'Only JPEG, PNG, GIF, and WebP images are allowed' } };
    }

    if (file.size > maxSize) {
        return { error: { message: 'File size must not exceed 10MB' } };
    }

    return { error: null };
};

/**
 * Middleware to validate request body
 */
const validateBody = (validationFunction) => {
    return (req, res, next) => {
        const { error, value } = validationFunction(req.body);

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                status: 'error',
                message: 'Validation failed',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }

        req.body = value;
        next();
    };
};

/**
 * Middleware to validate query parameters
 */
const validateQuery = (validationFunction) => {
    return (req, res, next) => {
        const { error, value } = validationFunction(req.query);

        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                status: 'error',
                message: 'Query validation failed',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }

        req.query = value;
        next();
    };
};

module.exports = {
    // Validation functions
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validateCreatePost,
    validateCreateComment,
    validatePagination,
    validatePasswordChange,
    validateSearch,
    validateNotificationUpdate,
    validateIdParam,
    validateFileUpload,

    // Middleware
    validateBody,
    validateQuery,

    // Individual schemas for reuse
    schemas
};