import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Story Carousel Component
 * 
 * Displays:
 * - "Your Story" button to create/add story
 * - Horizontal list of stories from users
 * - User avatar + name for each story
 */
export default function StoryCarousel({ 
    stories = [], 
    userProfile,
    onCreateStoryPress,
    onStoryPress 
}) {
    const renderStoryItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.storyContainer}
            onPress={() => onStoryPress(item)}
            activeOpacity={0.8}
        >
            {/* Story image/thumbnail */}
            <Image
                source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }}
                style={styles.storyImage}
            />
            
            {/* Gradient overlay */}
            <View style={styles.storyOverlay} />
            
            {/* User avatar (small) - top left */}
            <Image
                source={{ 
                    uri: item.author?.avatar || item.author?.avatarUrl ||
                        'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(item.author?.name || 'User')
                }}
                style={styles.userAvatarSmall}
            />

            {/* User name */}
            <Text style={styles.storyName} numberOfLines={1}>
                {item.author?.firstName ? `${item.author.firstName} ${item.author.lastName || ''}` : item.author?.name || 'User'}
            </Text>

            {/* Unviewed indicator (blue circle) */}
            {!item.isViewed && <View style={styles.unviewedIndicator} />}
        </TouchableOpacity>
    );

    const renderCreateStory = () => (
        <TouchableOpacity 
            style={styles.createStoryContainer}
            onPress={onCreateStoryPress}
            activeOpacity={0.8}
        >
            {/* Background image (user's profile pic or placeholder) */}
            <Image
                source={{ 
                    uri: userProfile?.avatar || userProfile?.avatarUrl ||
                        'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(userProfile?.name || 'You')
                }}
                style={styles.createStoryImage}
            />
            
            {/* Overlay */}
            <View style={styles.createStoryOverlay} />
            
            {/* Add icon */}
            <View style={styles.addIconContainer}>
                <Ionicons name="add-circle" size={40} color="#1877f2" />
            </View>
            
            {/* Label */}
            <Text style={styles.createStoryLabel}>Your Story</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.carouselContainer}>
            <FlatList
                data={stories}
                renderItem={renderStoryItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                ListHeaderComponent={renderCreateStory}
                ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                contentContainerStyle={styles.contentContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    carouselContainer: {
        backgroundColor: '#fff',
        paddingVertical: 12,
        borderBottomWidth: 8,
        borderBottomColor: '#f0f2f5',
    },
    contentContainer: {
        paddingHorizontal: 12,
        gap: 8,
    },
    // Create Story
    createStoryContainer: {
        width: 100,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f2f5',
    },
    createStoryImage: {
        width: '100%',
        height: '100%',
        opacity: 0.4,
    },
    createStoryOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    addIconContainer: {
        position: 'absolute',
        bottom: 16,
        alignSelf: 'center',
        zIndex: 10,
    },
    createStoryLabel: {
        position: 'absolute',
        bottom: 8,
        alignSelf: 'center',
        fontSize: 12,
        fontWeight: '500',
        color: '#050505',
        zIndex: 10,
    },
    // Story Item
    storyContainer: {
        width: 100,
        height: 160,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f2f5',
    },
    storyImage: {
        width: '100%',
        height: '100%',
    },
    storyOverlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.15)',
    },
    userAvatarSmall: {
        width: 32,
        height: 32,
        borderRadius: 16,
        position: 'absolute',
        top: 8,
        left: 8,
        borderWidth: 2,
        borderColor: '#1877f2',
    },
    storyName: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        right: 8,
        fontSize: 11,
        fontWeight: '500',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    unviewedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#1877f2',
        borderWidth: 2,
        borderColor: '#fff',
    },
});
