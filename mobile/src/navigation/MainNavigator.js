import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import FeedScreen from '../screens/main/FeedScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';

/**
 * Main Navigator (Modernized)
 * 
 * Bottom tab navigator with 5 tabs:
 * - Home (Feed)
 * - Friends
 * - Create Post (center action)
 * - Video/Reels
 * - Menu (Profile)
 * 
 * Modern design with active state highlighting
 */

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    const { unreadCount } = useSelector((state) => state.notifications);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    let isCenterIcon = false;

                    if (route.name === 'Feed') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Friends') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'CreatePost') {
                        iconName = 'add-circle';
                        isCenterIcon = true;
                    } else if (route.name === 'Video') {
                        iconName = focused ? 'play-circle' : 'play-circle-outline';
                    } else if (route.name === 'Menu') {
                        iconName = focused ? 'menu' : 'menu';
                    }

                    // Show badge for unread notifications (on home tab)
                    if (route.name === 'Feed' && unreadCount > 0) {
                        return (
                            <View>
                                <Ionicons 
                                    name={iconName} 
                                    size={isCenterIcon ? 28 : size} 
                                    color={color}
                                />
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            </View>
                        );
                    }

                    return (
                        <Ionicons 
                            name={iconName} 
                            size={isCenterIcon ? 28 : size} 
                            color={color}
                        />
                    );
                },
                tabBarActiveTintColor: '#1877f2',
                tabBarInactiveTintColor: '#65676b',
                tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#e4e6eb',
                    paddingBottom: 4,
                },
                headerShown: false,
                tabBarLabel: ({ focused }) => {
                    const labels = {
                        'Feed': 'Home',
                        'Friends': 'Friends',
                        'CreatePost': '',
                        'Video': 'Video',
                        'Menu': 'Menu',
                    };
                    
                    // Hide label for create post button
                    if (route.name === 'CreatePost') {
                        return null;
                    }

                    return (
                        <Text style={[
                            styles.label,
                            focused && styles.labelActive
                        ]}>
                            {labels[route.name]}
                        </Text>
                    );
                },
            })}
        >
            <Tab.Screen 
                name="Feed" 
                component={FeedScreen}
                options={{
                    tabBarTestID: 'home-tab',
                }}
            />
            <Tab.Screen 
                name="Friends" 
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Friends',
                }}
            />
            <Tab.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Create Post',
                    tabBarLabel: '',
                }}
            />
            <Tab.Screen 
                name="Video" 
                component={FeedScreen}
                options={{
                    tabBarLabel: 'Video',
                }}
            />
            <Tab.Screen 
                name="Menu" 
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Menu',
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        right: -4,
        top: -4,
        backgroundColor: '#f02849',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
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
