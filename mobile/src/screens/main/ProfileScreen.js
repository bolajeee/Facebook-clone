import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import {
    fetchUserProfile,
    followUser,
    unfollowUser,
    optimisticFollow,
    optimisticUnfollow,
} from '../../store/slices/usersSlice';

/**
 * Profile Screen
 * 
 * Shows user profile with:
 * - Avatar and user info
 * - Stats (posts, followers, following)
 * - Follow/unfollow button (for other users)
 * - Edit profile button (for current user)
 * - Logout button (for current user)
 * - User's posts grid (coming soon)
 */

export default function ProfileScreen({ route }) {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { profiles, isLoadingProfile } = useSelector((state) => state.users);

    // Get userId from route params or use current user
    const userId = route?.params?.userId || currentUser?.id;
    const isOwnProfile = userId === currentUser?.id;

    // Get profile from Redux
    const profile = profiles[userId];

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserProfile(userId));
        }
    }, [userId]);

    const handleFollowToggle = () => {
        if (!profile) return;

        if (profile.isFollowing) {
            // Optimistic update
            dispatch(optimisticUnfollow({ userId }));
            // API call
            dispatch(unfollowUser(userId));
        } else {
            // Optimistic update
            dispatch(optimisticFollow({ userId }));
            // API call
            dispatch(followUser(userId));
        }
    };

    const handleLogout = () => {
        dispatch(logout());
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
                <Text style={styles.errorText}>User not found</Text>
            </View>
        );
    }

    const displayName =
        profile.firstName && profile.lastName
            ? `${profile.firstName} ${profile.lastName}`
            : profile.username;

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                {/* Avatar */}
                <Image
                    source={{
                        uri:
                            profile.avatar ||
                            'https://ui-avatars.com/api/?name=' +
                            encodeURIComponent(profile.username),
                    }}
                    style={styles.avatar}
                />

                {/* User info */}
                <Text style={styles.displayName}>{displayName}</Text>
                <Text style={styles.username}>@{profile.username}</Text>

                {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                {/* Stats */}
                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.postsCount || 0}</Text>
                        <Text style={styles.statLabel}>Posts</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.followersCount || 0}</Text>
                        <Text style={styles.statLabel}>Followers</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile.followingCount || 0}</Text>
                        <Text style={styles.statLabel}>Following</Text>
                    </View>
                </View>

                {/* Action buttons */}
                <View style={styles.actions}>
                    {isOwnProfile ? (
                        <>
                            <TouchableOpacity style={styles.editButton}>
                                <Text style={styles.editButtonText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                <Text style={styles.logoutButtonText}>Logout</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.followButton,
                                profile.isFollowing && styles.followingButton,
                            ]}
                            onPress={handleFollowToggle}
                        >
                            <Text
                                style={[
                                    styles.followButtonText,
                                    profile.isFollowing && styles.followingButtonText,
                                ]}
                            >
                                {profile.isFollowing ? 'Following' : 'Follow'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Posts section */}
            <View style={styles.postsSection}>
                <Text style={styles.sectionTitle}>Posts</Text>
                <View style={styles.postsPlaceholder}>
                    <Text style={styles.placeholderText}>
                        Posts grid coming soon...
                    </Text>
                </View>
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
    header: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#e4e6eb',
        marginBottom: 12,
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
        gap: 12,
        width: '100%',
    },
    editButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#e4e6eb',
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
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#ff4444',
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
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#1877f2',
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
});
