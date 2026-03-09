import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { usersAPI } from '../../api/users';
import { uploadAPI } from '../../api/upload';
import { updateUser } from '../../store/slices/authSlice';

/**
 * Edit Profile Screen
 * 
 * Allows users to edit their profile information:
 * - First name & last name
 * - Bio
 * - Avatar (profile picture)
 * 
 * Features:
 * - Image picker for avatar upload
 * - Form validation
 * - Loading states
 * - Error handling
 */

export default function EditProfileScreen({ navigation }) {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);

    // Form state
    const [firstName, setFirstName] = useState(currentUser?.firstName || '');
    const [lastName, setLastName] = useState(currentUser?.lastName || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [avatar, setAvatar] = useState(currentUser?.avatar || null);
    const [avatarUri, setAvatarUri] = useState(null);
    
    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (firstName.length > 50) {
            newErrors.firstName = 'First name must be 50 characters or less';
        }
        if (lastName.length > 50) {
            newErrors.lastName = 'Last name must be 50 characters or less';
        }
        if (bio.length > 500) {
            newErrors.bio = 'Bio must be 500 characters or less';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Pick image from gallery
    const handlePickImage = async () => {
        try {
            setIsLoading(true);

            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert('Permission denied', 'Camera roll access is required to change your avatar');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setAvatarUri(result.assets?.[0]?.uri || null);
            }
        } catch (error) {
            console.error('Image picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
        } finally {
            setIsLoading(false);
        }
    };

    // Save profile changes
    const handleSaveProfile = async () => {
        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setIsSaving(true);

            // Prepare update data
            const updateData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                bio: bio.trim(),
            };

            // Upload new avatar if selected
            if (avatarUri) {
                try {
                    console.log('[v0] Uploading avatar...');
                    const uploadResponse = await uploadAPI.uploadImage(avatarUri);
                    updateData.avatar = uploadResponse?.imageUrl;
                    console.log('[v0] Avatar uploaded successfully');
                } catch (uploadError) {
                    console.error('[v0] Avatar upload error:', uploadError);
                    Alert.alert('Upload Error', 'Failed to upload avatar. Profile will be updated without avatar.');
                }
            }

            // Update profile
            console.log('[v0] Updating profile with data:', updateData);
            const response = await usersAPI.updateProfile(updateData);
            
            // Update Redux store
            dispatch(updateUser(response.data?.data?.user || response.data?.user));

            // Reset avatar URI since upload was successful
            setAvatarUri(null);

            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('[v0] Profile update error:', error);
            
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            Alert.alert('Error', errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const displayAvatar = avatarUri || avatar || 'https://via.placeholder.com/150';

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back" size={28} color="#1877f2" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
                <Image
                    source={{ uri: displayAvatar }}
                    style={styles.avatar}
                />
                <TouchableOpacity 
                    style={styles.editAvatarButton}
                    onPress={handlePickImage}
                    disabled={isLoading}
                >
                    <Ionicons name="camera" size={16} color="white" />
                </TouchableOpacity>
                {avatarUri && (
                    <Text style={styles.avatarChangeText}>Avatar will be updated</Text>
                )}
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
                {/* First Name */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        style={[styles.input, errors.firstName && styles.inputError]}
                        placeholder="Enter first name"
                        placeholderTextColor="#999"
                        value={firstName}
                        onChangeText={setFirstName}
                        maxLength={50}
                        editable={!isSaving}
                    />
                    {errors.firstName && (
                        <Text style={styles.errorText}>{errors.firstName}</Text>
                    )}
                    <Text style={styles.charCount}>
                        {firstName.length}/50
                    </Text>
                </View>

                {/* Last Name */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        style={[styles.input, errors.lastName && styles.inputError]}
                        placeholder="Enter last name"
                        placeholderTextColor="#999"
                        value={lastName}
                        onChangeText={setLastName}
                        maxLength={50}
                        editable={!isSaving}
                    />
                    {errors.lastName && (
                        <Text style={styles.errorText}>{errors.lastName}</Text>
                    )}
                    <Text style={styles.charCount}>
                        {lastName.length}/50
                    </Text>
                </View>

                {/* Bio */}
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.bioInput, errors.bio && styles.inputError]}
                        placeholder="Tell us about yourself"
                        placeholderTextColor="#999"
                        value={bio}
                        onChangeText={setBio}
                        maxLength={500}
                        multiline
                        numberOfLines={4}
                        editable={!isSaving}
                    />
                    {errors.bio && (
                        <Text style={styles.errorText}>{errors.bio}</Text>
                    )}
                    <Text style={styles.charCount}>
                        {bio.length}/500
                    </Text>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonSection}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}
                    disabled={isSaving}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    avatarSection: {
        alignItems: 'center',
        paddingVertical: 24,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#f0f0f0',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 10,
        right: '25%',
        backgroundColor: '#1877f2',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    avatarChangeText: {
        marginTop: 12,
        fontSize: 12,
        color: '#1877f2',
        fontStyle: 'italic',
    },
    formSection: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#f9f9f9',
    },
    bioInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#000',
        backgroundColor: '#f9f9f9',
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: '#ff6b6b',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 12,
        marginTop: 4,
    },
    charCount: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
        textAlign: 'right',
    },
    buttonSection: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    saveButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#1877f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
});
