# Facebook Clone - Mobile App

React Native mobile application built with Expo.

## Tech Stack

- **React Native** with Expo
- **React Navigation** for routing
- **Redux Toolkit** for state management
- **Axios** for API calls
- **Socket.io Client** for real-time features
- **AsyncStorage** for local data persistence

## Project Structure

```
mobile/
├── src/
│   ├── api/              # API service layer
│   │   ├── client.js     # Axios instance with interceptors
│   │   ├── auth.js       # Auth API calls
│   │   ├── posts.js      # Posts API calls
│   │   └── notifications.js
│   ├── config/           # Configuration files
│   │   └── api.js        # API endpoints config
│   ├── navigation/       # Navigation setup
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/          # Screen components
│   │   ├── auth/         # Login, Register
│   │   ├── main/         # Feed, Notifications, Profile
│   │   └── SplashScreen.js
│   └── store/            # Redux store
│       ├── index.js      # Store configuration
│       └── slices/       # Redux slices
│           ├── authSlice.js
│           ├── postsSlice.js
│           └── notificationsSlice.js
├── App.js                # Root component
├── app.json              # Expo configuration
└── package.json
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update API configuration:
   - Open `src/config/api.js`
   - Update the `apiUrl` and `socketUrl` based on your environment:
     - **iOS Simulator**: `http://localhost:5000`
     - **Android Emulator**: `http://10.0.2.2:5000`
     - **Physical Device**: Use your computer's local IP (e.g., `http://192.168.1.100:5000`)

### Running the App

1. Start the Expo development server:
   ```bash
   npm start
   ```

2. Run on specific platform:
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web browser
   ```

3. Or scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Key Features Implemented (Phase 6)

✅ **Navigation Setup**
- Auth flow (Login/Register)
- Main app flow (Feed/Notifications/Profile)
- Automatic routing based on auth state

✅ **Redux Store**
- Auth slice with login/register/logout
- Posts slice with normalized state
- Notifications slice for real-time updates

✅ **API Layer**
- Axios client with interceptors
- Automatic token injection
- Token refresh logic
- Centralized error handling

✅ **Auth Screens**
- Login screen with validation
- Register screen with password confirmation
- Splash screen for auth checking

## Architecture Highlights

### 1. Token Management
- Access tokens stored in AsyncStorage
- Automatic token refresh on 401 errors
- Seamless user experience (no forced logout)

### 2. Normalized Redux State
- Posts stored by ID for efficient updates
- Optimistic UI updates for likes
- Cursor-based pagination support

### 3. Navigation Flow
```
App Start
  ↓
Check Auth (AsyncStorage)
  ↓
├─ Authenticated → Main Navigator (Tabs)
│                   ├─ Feed
│                   ├─ Notifications
│                   └─ Profile
│
└─ Not Authenticated → Auth Navigator (Stack)
                        ├─ Login
                        └─ Register
```

## Next Steps (Phase 7)

- Implement Feed screen with FlashList
- Add pull-to-refresh
- Implement cursor pagination
- Add skeleton loading states
- Implement offline caching

## Troubleshooting

### Cannot connect to backend
- Make sure the backend server is running on `http://localhost:5000`
- Check your API configuration in `src/config/api.js`
- For Android Emulator, use `10.0.2.2` instead of `localhost`
- For physical devices, use your computer's local IP address

### Expo Go app not connecting
- Ensure your phone and computer are on the same WiFi network
- Try restarting the Expo development server
- Clear Expo cache: `expo start -c`

### Dependencies issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
expo start -c
```
