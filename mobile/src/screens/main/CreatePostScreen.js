import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../store/slices/postsSlice';
import { uploadAPI } from '../../api/upload';

/**
 * Create Post Screen
 * 
 * Allows users to create new posts with:
 * - Text content
 * - Optional image (from camera or gallery)
 * - Optimistic UI updates
 * - Loading states
 * - Web support with file input
 * 
 * Note: Image upload to Cloudinary is handled by backend
 */

export default function CreatePostScreen({ navigation }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const fileInputRef = useRef(null);

    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    /**
     * Handle web file input
     */
    const handleWebFileInput = (event) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                Alert.alert('Error', 'Please select an image file');
                return;
            }

            // Create local URL for preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    /**
     * Request permissions and pick image from gallery
     */
    const pickImage = async () => {
        // On web, use file input
        if (Platform.OS === 'web') {
            fileInputRef.current?.click();
            return;
        }

        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant camera roll permissions to upload images.'
                );
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    /**
     * Take photo with camera
     */
    const takePhoto = async () => {
        // Camera not available on web
        if (Platform.OS === 'web') {
            Alert.alert('Not Available', 'Camera is not available on web. Please use "Choose from Gallery" instead.');
            return;
        }

        try {
            // Request permission
            const { status } = await ImagePicker.requestCameraPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant camera permissions to take photos.'
                );
                return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Camera error:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    /**
     * Show image picker options
     */
    const showImageOptions = () => {
        if (Platform.OS === 'web') {
            // On web, directly open file picker
            pickImage();
            return;
        }

        Alert.alert(
            'Add Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Gallery', onPress: pickImage },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    /**
     * Remove selected image
     */
    const removeImage = () => {
        setSelectedImage(null);
        // Reset file input on web
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /**
     * Create and publish post
     */
    const handleCreatePost = async () => {
        // Validation
        if (!content.trim() && !selectedImage) {
            Alert.alert('Error', 'Please add some content or an image');
            return;
        }

        setIsUploading(true);

        try {
            let imageUrl = null;

            // Upload image if selected
            if (selectedImage) {
                console.log('Uploading image...');
                const uploadData = await uploadAPI.uploadImage(selectedImage);
                imageUrl = uploadData?.imageUrl || null;
                console.log('Image uploaded:', imageUrl);
            }

            // Create post data
            const postData = {
                content: content.trim() || '',
                imageUrl: imageUrl,
            };

            console.log('Creating post with data:', postData);

            // Send to backend
            const result = await dispatch(createPost(postData)).unwrap();

            // Navigate back after success
            navigation.goBack();

            console.log('Post created successfully!');
        } catch (error) {
            console.error('Create post error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to create post. Please try again.'
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Hidden file input for web */}
            {Platform.OS === 'web' && (
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleWebFileInput}
                />
            )}

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Post</Text>
                    <TouchableOpacity
                        onPress={handleCreatePost}
                        disabled={isUploading || (!content.trim() && !selectedImage)}
                    >
                        <Text
                            style={[
                                styles.postButton,
                                (isUploading || (!content.trim() && !selectedImage)) &&
                                styles.postButtonDisabled,
                            ]}
                        >
                            {isUploading ? 'Posting...' : 'Post'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* User info */}
                <View style={styles.userInfo}>
                    <Image
                        source={{
                            uri: user?.avatar || 'https://ui-avatars.com/api/?name=' +
                                encodeURIComponent(user?.username || 'User')
                        }}
                        style={styles.avatar}
                    />
                    <Text style={styles.userName}>
                        {user?.firstName && user?.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user?.username || 'User'}
                    </Text>
                </View>

                {/* Content input */}
                <TextInput
                    style={styles.input}
                    placeholder="What's on your mind?"
                    placeholderTextColor="#65676b"
                    multiline
                    value={content}
                    onChangeText={setContent}
                    editable={!isUploading}
                />

                {/* Selected image preview */}
                {selectedImage && (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                        <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={removeImage}
                            disabled={isUploading}
                        >
                            <Text style={styles.removeImageText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Add photo button */}
                {!selectedImage && (
                    <TouchableOpacity
                        style={styles.addPhotoButton}
                        onPress={showImageOptions}
                        disabled={isUploading}
                    >
                        <Text style={styles.addPhotoText}>📷 Add Photo</Text>
                    </TouchableOpacity>
                )}

                {/* Loading indicator */}
                {isUploading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1877f2" />
                        <Text style={styles.loadingText}>
                            {selectedImage ? 'Uploading image...' : 'Creating post...'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
        marginBottom: 12,
    },
    cancelButton: {
        fontSize: 16,
        color: '#050505',
        fontWeight: '500',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#050505',
    },
    postButton: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1877f2',
    },
    postButtonDisabled: {
        color: '#bcc0c4',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        marginHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e4e6eb',
    },
    userName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#050505',
        marginLeft: 10,
    },
    input: {
        fontSize: 16,
        color: '#050505',
        paddingHorizontal: 12,
        paddingVertical: 12,
        minHeight: 140,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        marginHorizontal: 12,
        borderRadius: 12,
        lineHeight: 22,
        marginBottom: 12,
    },
    imageContainer: {
        marginHorizontal: 12,
        marginVertical: 8,
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 300,
        backgroundColor: '#e4e6eb',
    },
    removeImageButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    addPhotoButton: {
        marginHorizontal: 12,
        marginVertical: 8,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    addPhotoText: {
        fontSize: 16,
        color: '#65676b',
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 14,
        color: '#65676b',
    },
});
