/**
 * Cloudinary Upload Utility
 * 
 * Handles image uploads to Cloudinary.
 * In production, you'd get these credentials from your backend
 * or environment variables.
 */

const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'your_upload_preset'; // Replace with your upload preset

/**
 * Upload image to Cloudinary
 * @param {string} imageUri - Local image URI from image picker
 * @returns {Promise<string>} - Cloudinary image URL
 */
export const uploadImageToCloudinary = async (imageUri) => {
    try {
        // Create form data
        const formData = new FormData();

        // Extract filename from URI
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('file', {
            uri: imageUri,
            name: filename,
            type,
        });
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        // Upload to Cloudinary
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        // Return the secure URL
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Alternative: Upload through your backend
 * This is more secure as it keeps Cloudinary credentials on the server
 */
export const uploadImageThroughBackend = async (imageUri, apiClient) => {
    try {
        const formData = new FormData();

        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
            uri: imageUri,
            name: filename,
            type,
        });

        // Send to your backend endpoint
        const response = await apiClient.post('/upload/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.imageUrl;
    } catch (error) {
        console.error('Backend upload error:', error);
        throw error;
    }
};
