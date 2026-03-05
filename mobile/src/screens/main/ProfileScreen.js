import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    Dimensions,
    FlatList,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../../store/slices/authSlice';
import {
    fetchUserProfile,
    followUser,
    unfollowUser,
    optimisticFollow,
    optimisticUnfollow,
    fetchUserPosts,
} from '../../store/slices/usersSlice';

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 3;
const GRID_SPACING = 2;
const GRID_ITEM_SIZE = (width - (GRID_COLUMNS + 1) * GRID_SPACING) / GRID_COLUMNS;

/**
 * Profile Screen
 * 
 * Enhanced profile with:
 * - Beautiful cover photo and avatar
 * - Stats (posts, followers, following)
 * - Follow/unfollow functionality
 * - Posts grid with images
 * - Pull to refresh
 * - Smooth animations
 */

export default function ProfileScreen({ route }) {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { user: currentUser, accessToken } = useSelector((state) => state.auth);
    const { profiles, isLoadingProfile, userPosts, isLoadingPosts } = useSelector((state) => state.users);
    const { byId: postsById } = useSelector((state) => state.posts);

    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('grid'); // 'grid' or 'list'
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    // Get userId from route params or use current user
    const userId = route?.params?.userId || currentUser?.id;
    const isOwnProfile = userId === currentUser?.id;

    // Get profile and posts from Redux
    const profile = profiles[userId];
    const userPostsData = userPosts[userId];
    const posts = userPostsData?.postIds?.map(id => postsById[id]).filter(Boolean) || [];

    // Debug: Log posts data
    useEffect(() => {
        if (posts.length > 0) {
            console.log('Profile posts count:', posts.length);
            console.log('Posts with images:', posts.filter(p => p.imageUrl).length);
            console.log('Sample post:', posts[0]);
        }
    }, [posts.length]);

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserProfile(userId));
            dispatch(fetchUserPosts({ userId, cursor: null, limit: 20 }));
        }
    }, [userId, dispatch]);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            dispatch(fetchUserProfile(userId)),
            dispatch(fetchUserPosts({ userId, cursor: null, limit: 20 }))
        ]);
        setRefreshing(false);
    }, [userId]);

    const handleFollowToggle = () => {
        if (!profile) return;

        if (profile.isFollowing) {
            dispatch(optimisticUnfollow({ userId }));
            dispatch(unfollowUser(userId));
        } else {
            dispatch(optimisticFollow({ userId }));
            dispatch(followUser(userId));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
    };

    const handlePostPress = (post) => {
        // Navigate to post detail (not implemented yet)
        console.log('Post pressed:', post.id);
    };

    const handleEditAvatar = async () => {
        console.log('handleEditAvatar called, isOwnProfile:', isOwnProfile);

        if (!isOwnProfile) {
            console.log('Not own profile, returning');
            return;
        }

        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Permission status:', status);

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant photo library permissions.');
                return;
            }

            // Launch image picker
            console.log('Launching image picker for avatar...');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1], // Square for avatar
                quality: 0.8,
            });

            console.log('Image picker result:', result.canceled ? 'Canceled' : 'Selected');

            if (!result.canceled) {
                setIsUploadingAvatar(true);

                try {
                    // Create FormData - React Native Web compatible
                    const formData = new FormData();
                    const uri = result.assets[0].uri;

                    // For web, we need to fetch the blob first
                    const response = await fetch(uri);
                    const blob = await response.blob();

                    // Create a File object from the blob
                    const filename = uri.split('/').pop() || 'avatar.jpg';
                    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

                    formData.append('image', file);

                    // Upload to backend
                    console.log('Uploading avatar with token:', accessToken ? 'Token exists' : 'No token');
                    const uploadResponse = await fetch('http://localhost:5000/api/upload/image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                        body: formData,
                    });

                    const uploadData = await uploadResponse.json();

                    if (!uploadResponse.ok) {
                        throw new Error(uploadData.message || 'Upload failed');
                    }

                    const imageUrl = uploadData.data.imageUrl;

                    // Update profile with new avatar
                    const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({ avatar: imageUrl }),
                    });

                    const profileData = await profileResponse.json();

                    if (!profileResponse.ok) {
                        throw new Error(profileData.message || 'Profile update failed');
                    }

                    // Refresh profile
                    await dispatch(fetchUserProfile(userId));
                    Alert.alert('Success', 'Avatar updated successfully!');
                } catch (error) {
                    console.error('Upload error:', error);
                    Alert.alert('Error', error.message || 'Failed to upload avatar');
                }

                setIsUploadingAvatar(false);
            }
        } catch (error) {
            console.error('Avatar picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
            setIsUploadingAvatar(false);
        }
    };

    const handleEditCover = async () => {
        console.log('handleEditCover called, isOwnProfile:', isOwnProfile);

        if (!isOwnProfile) {
            console.log('Not own profile, returning');
            return;
        }

        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('Permission status:', status);

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant photo library permissions.');
                return;
            }

            // Launch image picker
            console.log('Launching image picker for cover...');
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [16, 9], // Wide for cover
                quality: 0.8,
            });

            console.log('Image picker result:', result.canceled ? 'Canceled' : 'Selected');

            if (!result.canceled) {
                setIsUploadingCover(true);

                try {
                    // Create FormData - React Native Web compatible
                    const formData = new FormData();
                    const uri = result.assets[0].uri;

                    // For web, we need to fetch the blob first
                    const response = await fetch(uri);
                    const blob = await response.blob();

                    // Create a File object from the blob
                    const filename = uri.split('/').pop() || 'cover.jpg';
                    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });

                    formData.append('image', file);

                    // Upload to backend
                    console.log('Uploading cover with token:', accessToken ? 'Token exists' : 'No token');
                    const uploadResponse = await fetch('http://localhost:5000/api/upload/image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                        },
                        body: formData,
                    });

                    const uploadData = await uploadResponse.json();

                    if (!uploadResponse.ok) {
                        throw new Error(uploadData.message || 'Upload failed');
                    }

                    const imageUrl = uploadData.data.imageUrl;

                    // Update profile with new cover photo
                    const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({ coverPhoto: imageUrl }),
                    });

                    const profileData = await profileResponse.json();

                    if (!profileResponse.ok) {
                        throw new Error(profileData.message || 'Profile update failed');
                    }

                    // Refresh profile
                    await dispatch(fetchUserProfile(userId));
                    Alert.alert('Success', 'Cover photo updated successfully!');
                } catch (error) {
                    console.error('Upload error:', error);
                    Alert.alert('Error', error.message || 'Failed to upload cover photo');
                }

                setIsUploadingCover(false);
            }
        } catch (error) {
            console.error('Cover picker error:', error);
            Alert.alert('Error', 'Failed to pick image');
            setIsUploadingCover(false);
        }
    };

    const renderGridItem = ({ item }) => {
        // Debug: Log post data to see what we have
        console.log('Grid item:', {
            id: item.id,
            hasImage: !!item.imageUrl,
            imageUrl: item.imageUrl,
            content: item.content?.substring(0, 30)
        });

        return (
            <TouchableOpacity
                style={styles.gridItem}
                onPress={() => handlePostPress(item)}
                activeOpacity={0.8}
            >
                {(item.imageUrl && item.imageUrl !== 'null') ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.gridImage}
                        resizeMode="cover"
                        onError={(e) => console.log('Image load error for', item.id, ':', e.nativeEvent.error)}
                        onLoad={() => console.log('Image loaded successfully:', item.id)}
                    />
                ) : (
                    <View style={styles.gridTextPost}>
                        <Text style={styles.gridTextContent} numberOfLines={4}>
                            {item.content || 'No content'}
                        </Text>
                    </View>
                )}
                {/* Overlay with stats */}
                <View style={styles.gridOverlay}>
                    <View style={styles.gridStat}>
                        <Ionicons name="heart" size={16} color="#fff" />
                        <Text style={styles.gridStatText}>{item.likesCount || 0}</Text>
                    </View>
                    <View style={styles.gridStat}>
                        <Ionicons name="chatbubble" size={16} color="#fff" />
                        <Text style={styles.gridStatText}>{item.commentsCount || 0}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoadingProfile && !profile) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1877f2" />
            </View>
        );
    }

    if (!profile) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="person-circle-outline" size={80} color="#bcc0c4" />
                <Text style={styles.errorText}>User not found</Text>
            </View>
        );
    }

    const displayName =
        profile.firstName && profile.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : profile.username;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={['#1877f2']}
                    tintColor="#1877f2"
                />
            }
        >
            {/* Cover Photo Section */}
            <View style={styles.coverSection}>
                <Image
                    source={{
                        uri: profile.coverPhoto ||
                            'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=400&fit=crop',
                    }}
                    style={styles.coverPhoto}
                />

                {isOwnProfile && (
                    <TouchableOpacity
                        style={styles.editCoverButton}
                        onPress={() => {
                            console.log('Cover button pressed!');
                            handleEditCover();
                        }}
                        disabled={isUploadingCover}
                        activeOpacity={0.7}
                    >
                        {isUploadingCover ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="camera" size={18} color="#fff" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Profile Picture - Outside coverSection to avoid whitespace */}
            <View style={styles.profilePictureWrapper}>
                <Image
                    source={{
                        uri: profile.avatar ||
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(profile.username) +
                            '&background=1877f2&color=fff&size=200',
                    }}
                    style={styles.profilePicture}
                />

                {isOwnProfile && (
                    <TouchableOpacity
                        style={styles.editPictureButton}
                        onPress={() => {
                            console.log('Avatar button pressed!');
                            handleEditAvatar();
                        }}
                        disabled={isUploadingAvatar}
                        activeOpacity={0.7}
                    >
                        {isUploadingAvatar ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="camera" size={14} color="#fff" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Profile Info Section */}
            <View style={styles.infoSection}>
                <Text style={styles.displayName}>{displayName}</Text>
                <Text style={styles.username}>@{profile.username}</Text>

                {profile.bio && (
                    <Text style={styles.bio}>{profile.bio}</Text>
                )}

                {/* Stats */}
                <View style={styles.stats}>
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.postsCount || 0}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.followersCount || 0}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.followingCount || 0}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </TouchableOpacity>
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                    {isOwnProfile ? (
                        <>
                            <TouchableOpacity style={styles.editButton}>
                                <Ionicons name="create-outline" size={18} color="#050505" />
                                <Text style={styles.editButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Ionicons name="log-out-outline" size={18} color="#fff" />
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[
                                    styles.followButton,
                                    profile.isFollowing && styles.followingButton,
                                ]}
                                onPress={handleFollowToggle}
                            >
                                <Ionicons
                                    name={profile.isFollowing ? "checkmark" : "person-add"}
                                    size={18}
                                    color={profile.isFollowing ? "#050505" : "#fff"}
                                />
                                <Text
                                    style={[
                                        styles.followButtonText,
                                        profile.isFollowing && styles.followingButtonText,
                                    ]}
                                >
                                    {profile.isFollowing ? 'Following' : 'Follow'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Ionicons name="chatbubble-outline" size={20} color="#050505" />
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* Posts Grid Section */}
            <View style={styles.postsSection}>
                <View style={styles.postsSectionHeader}>
                    <Text style={styles.sectionTitle}>Posts</Text>
                    <View style={styles.tabButtons}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'grid' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('grid')}
                        >
                            <Ionicons
                                name="grid"
                                size={20}
                                color={activeTab === 'grid' ? '#1877f2' : '#65676b'}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'list' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('list')}
                        >
                            <Ionicons
                                name="list"
                                size={20}
                                color={activeTab === 'list' ? '#1877f2' : '#65676b'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {isLoadingPosts && posts.length === 0 ? (
                    <View style={styles.loadingPosts}>
                        <ActivityIndicator size="small" color="#1877f2" />
                    </View>
                ) : posts.length === 0 ? (
                    <View style={styles.emptyPosts}>
                        <Ionicons name="images-outline" size={60} color="#bcc0c4" />
                        <Text style={styles.emptyPostsText}>
                            {isOwnProfile ? 'No posts yet' : 'No posts to show'}
                        </Text>
                    </View>
                ) : activeTab === 'grid' ? (
                    <FlatList
                        data={posts}
                        renderItem={renderGridItem}
                        keyExtractor={(item, index) => `post-${item.id}-${index}`}
                        numColumns={GRID_COLUMNS}
                        scrollEnabled={false}
                        columnWrapperStyle={styles.gridRow}
                        contentContainerStyle={styles.gridContainer}
                    />
                ) : (
                    <View style={styles.listView}>
                        <Text style={styles.emptyPostsText}>List view coming soon...</Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        fontSize: 16,
        color: '#65676b',
    },
    coverSection: {
        position: 'relative',
        backgroundColor: '#f0f2f5',
        zIndex: 1,
        overflow: 'hidden',
    },
    coverPhoto: {
        width: '100%',
        height: 220,
        backgroundColor: '#e4e6eb',
    },
    editCoverButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        elevation: 5, // For Android
    },
    profilePictureWrapper: {
        alignItems: 'center',
        marginTop: -60,
        marginBottom: 16,
        position: 'relative',
        zIndex: 2,
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
        backgroundColor: '#e4e6eb',
    },
    editPictureButton: {
        position: 'absolute',
        bottom: 0,
        right: width / 2 - 70,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#1877f2',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        zIndex: 3,
        elevation: 6,
    },
    infoSection: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    displayName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#050505',
        marginBottom: 4,
    },
    username: {
        fontSize: 16,
        color: '#65676b',
        marginBottom: 12,
    },
    bio: {
        fontSize: 15,
        color: '#050505',
        textAlign: 'center',
        marginBottom: 16,
        paddingHorizontal: 20,
    },
    stats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#e4e6eb',
        marginBottom: 16,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#050505',
    },
    statLabel: {
        fontSize: 14,
        color: '#65676b',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        width: '100%',
        marginTop: 12,
    },
    editButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#e4e6eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#050505',
    },
    logoutButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#f02849',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    followButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#1877f2',
        justifyContent: 'center',
        alignItems: 'center',
    },
    followButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    followingButton: {
        backgroundColor: '#e4e6eb',
    },
    followingButtonText: {
        color: '#050505',
    },
    messageButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postsSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#050505',
        marginBottom: 12,
    },
    postsPlaceholder: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 8,
    },
    placeholderText: {
        fontSize: 15,
        color: '#65676b',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    postsSection: {
        paddingTop: 16,
    },
    postsSectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#050505',
    },
    tabButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    tabButton: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabButtonActive: {
        backgroundColor: '#e7f3ff',
    },
    loadingPosts: {
        padding: 40,
        alignItems: 'center',
    },
    emptyPosts: {
        padding: 40,
        alignItems: 'center',
    },
    emptyPostsText: {
        fontSize: 15,
        color: '#65676b',
        marginTop: 12,
    },
    listView: {
        padding: 40,
        alignItems: 'center',
    },
    gridContainer: {
        paddingBottom: 20,
    },
    gridRow: {
        gap: GRID_SPACING,
        paddingHorizontal: GRID_SPACING,
        marginBottom: GRID_SPACING,
    },
    gridItem: {
        width: GRID_ITEM_SIZE,
        height: GRID_ITEM_SIZE,
        position: 'relative',
        backgroundColor: '#f0f2f5',
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    gridTextPost: {
        width: '100%',
        height: '100%',
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e7f3ff',
    },
    gridTextContent: {
        fontSize: 11,
        color: '#050505',
        textAlign: 'center',
    },
    gridOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        opacity: 0,
    },
    gridStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    gridStatText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
});
