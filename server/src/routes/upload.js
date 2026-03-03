/**
 * Upload Routes
 * Handles image uploads to Cloudinary
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import middleware and controllers
const { authenticate } = require('../middleware/auth');
const { uploadImage, deleteImage } = require('../controllers/uploadController');

/**
 * Configure multer for temporary file storage
 */
const uploadDir = path.join(__dirname, '../../uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'));
        }
    }
});

/**
 * @route   POST /api/upload/image
 * @desc    Upload an image
 * @access  Private
 * @body    FormData with 'image' file field
 */
router.post('/image',
    authenticate,
    upload.single('image'),
    uploadImage
);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete an image from Cloudinary
 * @access  Private
 * @body    { publicId }
 */
router.delete('/image',
    authenticate,
    deleteImage
);

module.exports = router;
