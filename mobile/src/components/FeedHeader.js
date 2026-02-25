import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Feed Header Component
 * 
 * Displays:
 * - Facebook logo/text
 * - Search bar
 * - Icons for: messenger, friend requests, video call
 */
export default function FeedHeader({ onSearchPress, onMessengerPress, onFriendsPress, onVideoCallPress }) {
    return (
        <View style={styles.container}>
            {/* Logo and title */}
            <View style={styles.titleSection}>
                <Text style={styles.title}>facebook</Text>
            </View>

            {/* Search bar and icons */}
            <View style={styles.actionBar}>
                {/* Search */}
                <TouchableOpacity 
                    style={styles.searchBar}
                    onPress={onSearchPress}
                    activeOpacity={0.7}
                >
                    <Ionicons name="search" size={18} color="#65676b" />
                    <Text style={styles.searchPlaceholder}>Search Facebook</Text>
                </TouchableOpacity>

                {/* Icons row */}
                <View style={styles.iconsRow}>
                    {/* Messenger */}
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={onMessengerPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chatbubble-outline" size={22} color="#1877f2" />
                    </TouchableOpacity>

                    {/* Friend requests */}
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={onFriendsPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="person-add-outline" size={22} color="#1877f2" />
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>3</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Video call */}
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={onVideoCallPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="videocam-outline" size={22} color="#1877f2" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        paddingTop: 12,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
    },
    titleSection: {
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1877f2',
        letterSpacing: -1,
    },
    actionBar: {
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 36,
        gap: 8,
    },
    searchPlaceholder: {
        fontSize: 15,
        color: '#65676b',
    },
    iconsRow: {
        flexDirection: 'row',
        gap: 4,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 50,
        backgroundColor: '#f0f2f5',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        backgroundColor: '#f02849',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '600',
    },
});
