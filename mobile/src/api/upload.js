import apiClient from './client';
import { Platform } from 'react-native';

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

        if (Platform.OS === 'web') {
            const fetchResponse = await fetch(imageUri);
            const blob = await fetchResponse.blob();
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
            formData.append('image', file);
        } else {
            const filename = imageUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type,
            });
        }

        const response = await apiClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data?.data;
    },

    /**
     * Delete image from Cloudinary
     * @param {string} publicId - Cloudinary public ID
     */
    deleteImage: (publicId) => {
        return apiClient.delete('/upload/image', {
            data: { publicId }
        }).then((response) => response.data?.data || response.data);
    },
};
