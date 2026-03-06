import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Mobile Header Component (Modernized)
 * 
 * Displays:
 * - Facebook logo (sticky)
 * - Three circular action buttons: Search, Messages, Notifications
 * - Minimal, clean design with modern spacing
 * - Soft shadow elevation on scroll
 */
export default function MobileHeader({ 
    onSearchPress, 
    onMessengerPress, 
    onNotificationsPress,
    notificationBadge = 0 
}) {
    return (
        <View style={styles.container}>
            {/* Main header row */}
            <View style={styles.headerRow}>
                {/* Logo/Title */}
                <View style={styles.logoSection}>
                    <Text style={styles.logo}>facebook</Text>
                </View>

                {/* Action buttons */}
                <View style={styles.actionsContainer}>
                    {/* Search button */}
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={onSearchPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="search" size={20} color="#65676b" />
                    </TouchableOpacity>

                    {/* Messenger button */}
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={onMessengerPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chatbubble-outline" size={20} color="#65676b" />
                    </TouchableOpacity>

                    {/* Notifications button with badge */}
                    <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={onNotificationsPress}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="notifications-outline" size={20} color="#65676b" />
                        {notificationBadge > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {notificationBadge > 99 ? '99+' : notificationBadge}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e4e6eb',
        paddingTop: 8,
        paddingBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 44,
    },
    logoSection: {
        flex: 1,
    },
    logo: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1877f2',
        letterSpacing: -0.5,
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
});
