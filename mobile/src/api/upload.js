import apiClient from './client';

/**
 * Upload API Service
 * 
 * All upload-related API calls for images.
 * Handles image uploads to backend which forwards to Cloudinary.
 */

export const uploadAPI = {
    /**
     * Upload image to server (which uploads to Cloudinary)
     * @param {string} imageUri - Local image URI from image picker
     */
    uploadImage: async (imageUri) => {
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // Append image with proper structure
        formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
        });

        return apiClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Delete image from Cloudinary
     * @param {string} publicId - Cloudinary public ID
     */
    deleteImage: (publicId) => {
        return apiClient.delete('/upload/image', {
            data: { publicId }
        });
    },
};
