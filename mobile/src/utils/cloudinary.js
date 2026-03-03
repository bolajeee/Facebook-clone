/**
 * Image Upload Utility
 * 
 * Handles image uploads through the backend to Cloudinary.
 * Backend keeps Cloudinary credentials secure.
 */

/**
 * Upload image through backend (secure method)
 * @param {string} imageUri - Local image URI from image picker
 * @param {AxiosInstance} apiClient - API client instance with auth
 * @returns {Promise<{imageUrl: string, publicId: string}>} - Cloudinary image URL and metadata
 */
export const uploadImage = async (imageUri, apiClient) => {
    try {
        const formData = new FormData();

        // Extract filename and type from URI
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // Append image with proper structure
        formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
        });

        // Send to backend endpoint
        const response = await apiClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        if (response.status !== 200) {
            throw new Error(response.data?.message || 'Upload failed');
        }

        return response.data.data;
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
};

/**
 * Delete image from Cloudinary through backend
 * @param {string} publicId - Cloudinary public ID
 * @param {AxiosInstance} apiClient - API client instance with auth
 */
export const deleteImage = async (publicId, apiClient) => {
    try {
        const response = await apiClient.delete('/upload/image', {
            data: { publicId }
        });

        if (response.status !== 200) {
            throw new Error(response.data?.message || 'Delete failed');
        }

        return response.data;
    } catch (error) {
        console.error('Image deletion error:', error);
        throw error;
    }
};
