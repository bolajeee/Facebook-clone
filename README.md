# Facebook Clone - Full Stack Social Network

A production-grade social networking application built with React Native (Expo) and Node.js.

## 🚀 Tech Stack

### Backend
- **Node.js** + Express
- **PostgreSQL** with Prisma ORM
- **Redis** for caching
- **Socket.io** for real-time features
- **JWT** authentication
- **Cloudinary** for image uploads

### Mobile
- **React Native** with Expo
- **React Navigation** for routing
- **Redux Toolkit** for state management
- **Axios** for API calls
- **FlashList** for performance
- **Socket.io Client** for real-time updates

## 📁 Project Structure

```
Facebook-clone/
├── server/              # Backend API
│   ├── src/
│   │   ├── config/      # Database, Redis config
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth, error handling
│   │   ├── models/      # Prisma schema
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── socket/      # Socket.io handlers
│   │   └── utils/       # Helpers, logger
│   ├── prisma/          # Database schema
│   └── package.json
│
├── mobile/              # React Native app
│   ├── src/
│   │   ├── api/         # API service layer
│   │   ├── config/      # App configuration
│   │   ├── navigation/  # Navigation setup
│   │   ├── screens/     # Screen components
│   │   ├── store/       # Redux store
│   │   └── utils/       # Utilities
│   └── package.json
│
└── docs/                # Documentation
```

## 🎯 Features Implemented

### Backend ✅
- [x] Database design with Prisma
- [x] Express server setup
- [x] JWT authentication (access + refresh tokens)
- [x] Posts & Feed API with cursor pagination
- [x] Redis feed caching
- [x] Like & Comment system
- [x] Real-time notifications with Socket.io
- [x] Follow system
- [x] Error handling & logging

### Mobile ✅
- [x] React Native project setup
- [x] Navigation (Auth + Main flows)
- [x] Redux store (auth, posts, notifications)
- [x] API layer with token refresh
- [x] Login & Register screens
- [x] Connection testing utility
- [x] Phase 7: Feed Screen with FlashList
- [ ] Phase 8: Create Post with image upload
- [ ] Phase 9: Profile & Follow system
- [ ] Phase 10: Real-time notifications

## 🏃 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL
- Redis
- Expo CLI: `npm install -g expo-cli`

### 1. Backend Setup

```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Configure environment
# Edit .env with your database credentials

# Setup database
npm run db:generate
npm run db:push

# Verify setup
npm run verify

# Start server
npm run dev
```

Server runs on `http://localhost:5000`

### 2. Mobile Setup

```bash
# Navigate to mobile
cd mobile

# Install dependencies
npm install

# Configure API URL in src/config/api.js
# - iOS Simulator: http://localhost:5000/api
# - Android Emulator: http://10.0.2.2:5000/api
# - Physical Device: http://YOUR_IP:5000/api

# Start app
npm start
```

### 3. Test Connection

1. Open the mobile app
2. Tap "🔧 Test Server Connection" on login screen
3. Should show "Connection Successful! ✅"

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get running in 5 minutes
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[CONNECTION_TROUBLESHOOTING.md](./CONNECTION_TROUBLESHOOTING.md)** - Fix connection issues
- **[PHASE_6_COMPLETE.md](./PHASE_6_COMPLETE.md)** - Phase 6 summary
- **[implementation-plan.md](./implementation-plan.md)** - Full project plan

## 🔧 Troubleshooting

### Cannot connect to backend?

1. **Verify backend is running:**
   ```bash
   curl http://localhost:5000/health
   ```

2. **Check API URL in mobile app:**
   - Edit `mobile/src/config/api.js`
   - Use `10.0.2.2` for Android emulator
   - Use your IP for physical devices

3. **Test connection:**
   - Tap "Test Server Connection" button in app
   - Check console logs for errors

See [CONNECTION_TROUBLESHOOTING.md](./CONNECTION_TROUBLESHOOTING.md) for detailed solutions.

### Database issues?

```bash
cd server
npm run db:generate
npm run db:push
npm run verify
```

### Redis issues?

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# Start Redis if needed
# Windows: redis-server
# Mac: brew services start redis
# Linux: sudo systemctl start redis
```

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "redis": "connected",
    "server": "running"
  }
}
```

### Test Mobile Connection
1. Open app
2. Tap "Test Server Connection"
3. Should show success message

### Test Registration
1. Tap "Sign Up"
2. Fill in details
3. Should auto-login and show welcome screen

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Posts
- `GET /api/posts/feed` - Get user feed (paginated)
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like a post
- `DELETE /api/posts/:id/like` - Unlike a post
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/read-all` - Mark all as read

### Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/:id/follow` - Follow user
- `DELETE /api/users/:id/follow` - Unfollow user

## 🏗️ Architecture Highlights

### Backend
- **Clean Architecture**: Separation of concerns (routes → controllers → services)
- **Normalized Database**: Proper relations and indexes
- **Redis Caching**: Feed caching for performance
- **JWT Refresh**: Seamless token refresh
- **Socket.io**: Real-time notifications
- **Error Handling**: Centralized error middleware
- **Logging**: Winston logger with file rotation

### Mobile
- **Normalized Redux State**: Posts stored by ID
- **Optimistic Updates**: Instant UI feedback
- **Token Management**: Automatic refresh on 401
- **Cursor Pagination**: Efficient feed loading
- **Clean Navigation**: Auth flow separation
- **Type Safety Ready**: Structure supports TypeScript

## 🔐 Security Features

- Password hashing with bcrypt
- JWT access + refresh tokens
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation
- SQL injection prevention (Prisma)

## 🚀 Performance Optimizations

- Redis feed caching
- Cursor-based pagination
- Database indexes
- Normalized Redux state
- FlashList for large lists (Phase 7)
- Image optimization with Cloudinary
- Compression middleware

## 📊 Current Status

**Phase 6 Complete! ✅**

- Backend fully functional
- Mobile foundation ready
- Authentication working
- API layer configured
- Connection testing available

**Next: Phase 7 - Feed Screen Implementation**

## 🤝 Contributing

This is a learning project following production-grade patterns. Each phase builds incrementally with proper architecture.

## 📝 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built following senior-level architecture patterns for:
- Clean code organization
- Scalable state management
- Production-ready error handling
- Real-time features
- Mobile best practices

---

**Ready to start?** Follow the [QUICK_START.md](./QUICK_START.md) guide!

**Having issues?** Check [CONNECTION_TROUBLESHOOTING.md](./CONNECTION_TROUBLESHOOTING.md)
