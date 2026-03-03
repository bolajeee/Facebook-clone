# Phase 11 Integration Checklist

This document provides a step-by-step checklist for integrating all Phase 11 features into your app.

## Backend Integration

### Step 1: Set Up Environment Variables

In `/server/.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/facebook_clone_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT (Generate secure random strings)
JWT_SECRET=your-256-bit-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-256-bit-refresh-secret-key-change-this
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=5000
NODE_ENV=development
```

### Step 2: Run Database Migration

```bash
cd server
npx prisma migrate dev --name "add_comment_replies_and_uploads"
```

This creates:
- `parentCommentId` column in comments table
- Foreign key constraint for comment replies
- Index on `parentCommentId` for performance

### Step 3: Verify Server Setup

```bash
npm run verify
```

Expected output:
```
✓ PostgreSQL connected
✓ Redis connected
✓ Server ready on port 5000
```

### Step 4: Start Backend Server

```bash
npm run dev
```

Should see:
```
🚀 Server running on port 5000
📊 Health check available at http://localhost:5000/health
🔌 Socket.io server ready for connections
```

---

## Mobile Integration

### Step 1: Register Edit Profile Screen in Navigation

In your `MainNavigator.js` or equivalent:

```javascript
import EditProfileScreen from '../screens/main/EditProfileScreen';

export default function MainNavigator() {
  return (
    <Stack.Navigator>
      {/* ... other screens ... */}
      
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ 
          headerShown: false,
          // Optional: slide animation
          animationEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}
```

### Step 2: Add Navigation to Profile Screen

In `ProfileScreen.js`, add edit button handler:

```javascript
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen({ route }) {
  const navigation = useNavigation();
  const isOwnProfile = userId === currentUser?.id;

  return (
    <ScrollView>
      {/* ... existing profile content ... */}
      
      {isOwnProfile && (
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
```

### Step 3: Integrate Post Actions Menu

In `PostCard.js` or wherever posts are displayed:

```javascript
import { useState } from 'react';
import PostActionsMenu from '../components/PostActionsMenu';

export default function PostCard({ post }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const handleEditPost = () => {
    // Navigate to edit post screen or show inline edit
    navigation.navigate('EditPost', { post });
  };

  return (
    <View style={styles.container}>
      {/* Post header with actions button */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {/* Author avatar and name */}
        </View>
        
        {/* Three-dot menu button */}
        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Post content */}
      <View style={styles.content}>
        {/* Post text and image */}
      </View>

      {/* Post actions menu */}
      <PostActionsMenu
        post={post}
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEditPress={handleEditPost}
        onDeletePress={() => {
          // Post will be removed from Redux automatically
          // Optionally show toast or navigate
        }}
      />
    </View>
  );
}
```

### Step 4: Add Search Screen (Optional but Recommended)

Create `/mobile/src/screens/main/SearchScreen.js`:

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { usersAPI } from '../../api/users';
import { useDebounce } from '../../hooks/useDebounce'; // Create this hook

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery) => {
    try {
      setIsLoading(true);
      const response = await usersAPI.searchUsers(searchQuery);
      setResults(response.data.users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.username}>@{item.username}</Text>
        <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
        value={query}
        onChangeText={setQuery}
      />

      {isLoading && <ActivityIndicator size="large" color="#1877f2" />}

      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderUserItem}
        ListEmptyComponent={
          query && !isLoading ? (
            <Text style={styles.emptyText}>No users found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  searchInput: {
    margin: 12,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
  },
  userItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  userInfo: { flex: 1 },
  userName: { fontWeight: '600', fontSize: 14 },
  username: { color: '#666', fontSize: 12 },
  bio: { color: '#999', fontSize: 12, marginTop: 4 },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#999' },
});
```

Create debounce hook at `/mobile/src/hooks/useDebounce.js`:

```javascript
import { useState, useEffect } from 'react';

export function useDebounce(value, delayMs) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
```

### Step 5: Update Navigation with Search

In your `MainNavigator.js` or bottom tab navigator:

```javascript
<Stack.Screen 
  name="Search" 
  component={SearchScreen}
  options={{ headerShown: false }}
/>
```

### Step 6: Verify API Connection

Test the connection:

```javascript
// In a test component or on app startup
import apiClient from './api/client';

useEffect(() => {
  testConnection();
}, []);

const testConnection = async () => {
  try {
    const response = await apiClient.get('/test');
    console.log('[v0] Server connection successful:', response.data);
  } catch (error) {
    console.error('[v0] Server connection failed:', error);
  }
};
```

---

## Feature-by-Feature Integration

### Image Upload Integration

Add to any image selection component:

```javascript
import { uploadAPI } from '../api/upload';
import * as ImagePicker from 'expo-image-picker';

const handleUploadImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync();
  if (!result.cancelled) {
    try {
      const uploaded = await uploadAPI.uploadImage(result.uri);
      // Use uploaded.imageUrl in your post/profile
      console.log('Image URL:', uploaded.imageUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload image');
    }
  }
};
```

### User Search Integration

Add search to your feed or navigation:

```javascript
import { usersAPI } from '../api/users';

const [searchResults, setSearchResults] = useState([]);

const handleSearch = async (query) => {
  if (query.length === 0) {
    setSearchResults([]);
    return;
  }
  
  try {
    const response = await usersAPI.searchUsers(query);
    setSearchResults(response.data.users);
  } catch (error) {
    console.error('Search failed:', error);
  }
};
```

### Comment Replies Integration

In your comments list:

```javascript
import { postsAPI } from '../api/posts';

const [showReplyInput, setShowReplyInput] = useState(null);
const [replies, setReplies] = useState({});

const handleReply = async (commentId, replyText) => {
  try {
    await postsAPI.addComment(postId, replyText, commentId);
    // Reload comment and its replies
    const commentReplies = await postsAPI.getCommentReplies(commentId);
    setReplies(prev => ({
      ...prev,
      [commentId]: commentReplies.data.replies
    }));
  } catch (error) {
    Alert.alert('Error', 'Failed to add reply');
  }
};

const loadCommentReplies = async (commentId) => {
  try {
    const response = await postsAPI.getCommentReplies(commentId);
    setReplies(prev => ({
      ...prev,
      [commentId]: response.data.replies
    }));
  } catch (error) {
    console.error('Failed to load replies:', error);
  }
};
```

---

## Testing Checklist

After integration, test each feature:

- [ ] Image upload works in edit profile and create post
- [ ] User search returns results with correct follow status
- [ ] Token refresh works (stay logged in for extended time)
- [ ] Edit profile saves correctly and updates avatar
- [ ] Post actions menu appears for own posts with edit/delete
- [ ] Post actions menu shows report option for others' posts
- [ ] Comment creation works
- [ ] Comment replies can be created
- [ ] Comment replies display correctly
- [ ] Pagination works for comments and replies

---

## Common Issues & Solutions

### Issue: "Cannot find uploadController"
**Solution:** Verify file exists at `/server/src/controllers/uploadController.js`

### Issue: "Cloudinary credentials not set"
**Solution:** Check `.env` file has all Cloudinary variables set

### Issue: "Database migration fails"
**Solution:** 
```bash
npx prisma migrate resolve --rolled-back "add_comment_replies"
npx prisma migrate dev
```

### Issue: "Search endpoint returns 404"
**Solution:** Restart server after modifying routes

### Issue: "EditProfileScreen not found"
**Solution:** Verify screen is registered in navigation before using navigation.navigate()

### Issue: "Image upload hangs"
**Solution:** Check file size (< 5MB), ensure proper MIME type

---

## Performance Optimization Tips

1. **Debounce Search:** Implement 300ms debounce for search input
2. **Image Caching:** Use react-native-fast-image for optimized image loading
3. **Pagination:** Always use cursor-based pagination for lists
4. **Redux:** Keep normalized state to avoid duplicate data
5. **Lazy Loading:** Load comments/replies only when user expands

---

## Security Reminders

1. Never expose Cloudinary API secret in client code
2. Always validate JWT tokens on server
3. Sanitize all text inputs on server
4. Use HTTPS in production
5. Set secure JWT secrets (min 32 characters)
6. Use environment variables for all secrets

---

## Quick Start Commands

```bash
# Backend
cd server
npm install
cp .env.example .env
# Edit .env with your values
npx prisma migrate dev
npm run dev

# Mobile (in new terminal)
cd mobile
npx expo start

# Test connection
# Open mobile app and tap "Test Server Connection"
```

---

## Next Steps After Integration

1. Test all features thoroughly
2. Implement SearchScreen if not already done
3. Add missing Redux actions if needed
4. Update ProfileScreen with edit button
5. Update PostCard with actions menu
6. Begin Phase 12 features (Stories, Messaging, etc.)

---

## Support Resources

- **API Documentation:** See `/IMPLEMENTATION_SUMMARY.md`
- **Feature Details:** See `/PHASE_11_FEATURES.md`
- **Database Schema:** See `/server/prisma/schema.prisma`
- **Example Usage:** Check component props and Redux actions

---

**Integration Guide Complete!** You're ready to start Phase 12.
