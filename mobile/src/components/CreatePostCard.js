import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Create Post Card Component (Modernized)
 * 
 * Displays:
 * - User avatar and "What's on your mind?" input field
 * - Three action buttons: Live Video, Photo/Video, Feeling
 * - Card-based design with rounded corners and soft shadows
 */
export default function CreatePostCard({ 
    userAvatar,
    userName,
    onPress,
    onLivePress,
    onPhotoPress,
    onFeelingPress
}) {
    return (
        <View style={styles.container}>
            {/* Main card */}
            <View style={styles.card}>
                {/* User input section */}
                <View style={styles.inputSection}>
                    {/* User avatar */}
                    <Image
                        source={{
                            uri: userAvatar || 'https://ui-avatars.com/api/?name=' + 
                                encodeURIComponent(userName || 'User')
                        }}
                        style={styles.avatar}
                    />

                    {/* Input field */}
                    <TouchableOpacity 
                        style={styles.inputField}
                        onPress={onPress}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.inputPlaceholder}>
                            What's on your mind?
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Action buttons */}
                <View style={styles.actionsRow}>
                    {/* Live Video button */}
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={onLivePress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="videocam" size={20} color="#f02849" />
                        <Text style={styles.actionLabel}>Live</Text>
                    </TouchableOpacity>

                    {/* Photo/Video button */}
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={onPhotoPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="image" size={20} color="#31a24c" />
                        <Text style={styles.actionLabel}>Photo</Text>
                    </TouchableOpacity>

                    {/* Feeling button */}
                    <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={onFeelingPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="happy" size={20} color="#f0ad4e" />
                        <Text style={styles.actionLabel}>Feeling</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f0f2f5',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    inputSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e4e6eb',
    },
    inputField: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: 'center',
    },
    inputPlaceholder: {
        fontSize: 15,
        color: '#65676b',
    },
    divider: {
        height: 1,
        backgroundColor: '#e4e6eb',
        marginHorizontal: 12,
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 8,
    },
    actionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#65676b',
    },
});
