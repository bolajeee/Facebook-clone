import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import FeedScreen from '../screens/main/FeedScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';

/**
 * Main Navigator
 * 
 * Bottom tab navigator for the main app screens.
 * This is the standard mobile app pattern with tabs at the bottom.
 * 
 * Tabs:
 * - Home (Feed)
 * - Create Post (center button)
 * - Notifications
 * - Profile
 * 
 */

const Tab = createBottomTabNavigator();

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Feed') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'CreatePost') {
                        iconName = 'add-circle';
                    } else if (route.name === 'Notifications') {
                        iconName = focused ? 'notifications' : 'notifications-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#1877f2', // Facebook blue
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
            })}
        >
            <Tab.Screen name="Feed" component={FeedScreen} />
            <Tab.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{
                    tabBarLabel: 'Create',
                    headerShown: true,
                    headerTitle: 'Create Post',
                }}
            />
            <Tab.Screen name="Notifications" component={NotificationsScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
