import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import FeedScreen from '../screens/main/FeedScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CreatePostScreen from '../screens/main/CreatePostScreen';
import ConversationsScreen from '../screens/main/ConversationsScreen';
import ChatScreen from '../screens/main/ChatScreen';
import CommentsScreen from '../screens/main/CommentsScreen';

/**
 * Main Navigator
 * 
 * Bottom tab navigator for the main app screens matching Facebook's mobile nav.
 * 
 * Main Tabs (bottom):
 * - Feed (home)
 * - Video
 * - Friends
 * - Menu
 * 
 * With nested stack navigators for:
 * - Feed: includes Comments, Stories
 * - Conversations: includes Chat
 * - Profile: user profile
 * 
 */

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Feed Stack (with Stories, Comments, etc.)
function FeedStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animationEnabled: true,
            }}
        >
            <Stack.Screen name="FeedMain" component={FeedScreen} />
            <Stack.Screen 
                name="Comments" 
                component={CommentsScreen}
                options={{
                    headerShown: true,
                    headerTitle: 'Comments',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
}

// Messages Stack
function MessagesStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                animationEnabled: true,
            }}
        >
            <Stack.Screen 
                name="ConversationsList" 
                component={ConversationsScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen 
                name="Chat" 
                component={ChatScreen}
                options={{
                    headerShown: true,
                    headerBackTitle: 'Back',
                }}
            />
        </Stack.Navigator>
    );
}

// Profile Stack
function ProfileStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        </Stack.Navigator>
    );
}

// Create Post Navigator (modal style)
function CreateStackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerTitle: 'Create Post',
            }}
        >
            <Stack.Screen name="CreatePostScreen" component={CreatePostScreen} />
        </Stack.Navigator>
    );
}

export default function MainNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'FeedStack') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'VideoTab') {
                        iconName = focused ? 'play-circle' : 'play-circle-outline';
                    } else if (route.name === 'FriendsTab') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'MessagesTab') {
                        iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                    } else if (route.name === 'MenuTab') {
                        iconName = 'menu';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#1877f2',
                tabBarInactiveTintColor: '#65676b',
                tabBarLabel: '',
                headerShown: false,
            })}
        >
            {/* Feed Tab */}
            <Tab.Screen 
                name="FeedStack" 
                component={FeedStackNavigator}
                options={{
                    title: 'Feed',
                }}
            />

            {/* Video Tab */}
            <Tab.Screen 
                name="VideoTab" 
                component={FeedScreen}
                options={{
                    title: 'Video',
                }}
            />

            {/* Friends Tab */}
            <Tab.Screen 
                name="FriendsTab" 
                component={ProfileScreen}
                options={{
                    title: 'Friends',
                }}
            />

            {/* Messages Tab */}
            <Tab.Screen 
                name="MessagesTab" 
                component={MessagesStackNavigator}
                options={{
                    title: 'Messages',
                }}
            />

            {/* Menu Tab */}
            <Tab.Screen 
                name="MenuTab" 
                component={ProfileStackNavigator}
                options={{
                    title: 'Menu',
                }}
            />
        </Tab.Navigator>
    );
}
