/**
 * Upload Controller
 * Handles image uploads to Cloudinary with validation and optimization
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
const { ApiError, catchAsync } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

/**
 * Configure Cloudinary
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Allowed file types and max size
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload image to Cloudinary
 */
const uploadImage = catchAsync(async (req, res) => {
    const userId = req.user.id;

    if (!req.file) {
        throw new ApiError(400, 'No image file provided');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path);
        throw new ApiError(400, 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF');
    }

    // Validate file size
    if (req.file.size > MAX_FILE_SIZE) {
        fs.unlinkSync(req.file.path);
        throw new ApiError(400, 'File size exceeds 5MB limit');
    }

    try {
        // Upload to Cloudinary with optimization
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `facebook-clone/users/${userId}`,
            resource_type: 'auto',
            quality: 'auto',
            fetch_format: 'auto',
            max_width: 1920,
            max_height: 1920,
            crop: 'limit',
            tags: ['facebook-clone', userId]
        });

        // Delete temporary file
        fs.unlinkSync(req.file.path);

        logger.info(`Image uploaded for user ${userId}: ${result.public_id}`);

        res.status(200).json({
            status: 'success',
            message: 'Image uploaded successfully',
            data: {
                imageUrl: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                size: result.bytes
            }
        });
    } catch (error) {
        // Clean up temp file on error
        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (e) {
                // Ignore cleanup errors
            }
        }

        logger.error(`Image upload failed for user ${userId}:`, error);
        throw new ApiError(500, 'Failed to upload image. Please try again.');
    }
});

/**
 * Delete image from Cloudinary
 */
const deleteImage = catchAsync(async (req, res) => {
    const { publicId } = req.body;

    if (!publicId) {
        throw new ApiError(400, 'Public ID is required');
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== 'ok') {
            throw new ApiError(404, 'Image not found');
        }

        logger.info(`Image deleted: ${publicId}`);

        res.status(200).json({
            status: 'success',
            message: 'Image deleted successfully'
        });
    } catch (error) {
        logger.error(`Image deletion failed:`, error);
        throw new ApiError(500, 'Failed to delete image');
    }
});

module.exports = {
    uploadImage,
    deleteImage
};
