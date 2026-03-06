import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Bottom Navigation Component (Modernized)
 * 
 * 5-tab navigation with:
 * - Home
 * - Friends (new tab)
 * - Create (central action)
 * - Video/Reels
 * - Menu/More
 * 
 * Active state indication with blue highlight
 * Touch-friendly with 44px minimum tap targets
 */
export default function BottomNavigation({ 
    activeTab, 
    onTabPress,
    notificationBadge = 0
}) {
    const tabs = [
        { name: 'home', icon: 'home', label: 'Home' },
        { name: 'friends', icon: 'people', label: 'Friends' },
        { name: 'create', icon: 'add-circle', label: 'Create', isCenter: true },
        { name: 'video', icon: 'play-circle', label: 'Video' },
        { name: 'menu', icon: 'menu', label: 'Menu' },
    ];

    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => (
                <TouchableOpacity
                    key={tab.name}
                    style={[
                        styles.tabButton,
                        tab.isCenter && styles.centerTab,
                        activeTab === tab.name && styles.activeTab,
                    ]}
                    onPress={() => onTabPress(tab.name)}
                    activeOpacity={0.7}
                >
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name={activeTab === tab.name ? tab.icon : `${tab.icon}-outline`}
                            size={tab.isCenter ? 28 : 24}
                            color={activeTab === tab.name ? '#1877f2' : '#65676b'}
                        />
                        {tab.name === 'home' && notificationBadge > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {notificationBadge > 99 ? '99+' : notificationBadge}
                                </Text>
                            </View>
                        )}
                    </View>
                    {!tab.isCenter && (
                        <Text style={[
                            styles.label,
                            activeTab === tab.name && styles.labelActive
                        ]}>
                            {tab.label}
                        </Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e4e6eb',
        paddingBottom: 4,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        minHeight: 56,
        justifyContent: 'center',
    },
    centerTab: {
        paddingVertical: 4,
    },
    activeTab: {
        backgroundColor: 'rgba(24, 119, 242, 0.05)',
    },
    iconContainer: {
        position: 'relative',
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -2,
        backgroundColor: '#f02849',
        borderRadius: 8,
        minWidth: 16,
        height: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
    },
    label: {
        fontSize: 11,
        color: '#65676b',
        marginTop: 4,
        fontWeight: '500',
    },
    labelActive: {
        color: '#1877f2',
        fontWeight: '600',
    },
});
