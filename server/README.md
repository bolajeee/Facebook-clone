# Facebook Clone - Server

Production-grade Node.js + Express server for a social networking application.

## Tech Stack

- **Node.js + Express** - Web framework
- **PostgreSQL + Prisma** - Database and ORM
- **Redis** - Caching and session management
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Winston** - Logging
- **Cloudinary** - Image uploads

## Project Structure

```
server/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── socket/          # Socket.io event handlers
│   ├── utils/           # Utility functions
│   └── index.js         # Main server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── logs/                # Application logs
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Database URL (PostgreSQL)
- JWT secrets
- Redis connection
- Cloudinary credentials

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Authentication (Phase 3)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh JWT token

### Posts (Phase 4)
- `GET /api/posts/feed` - Get user feed
- `POST /api/posts` - Create new post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comment` - Comment on post

### Users (Phase 9)
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/follow/:id` - Follow user
- `DELETE /api/users/follow/:id` - Unfollow user

### Notifications (Phase 5)
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## Real-time Events (Socket.io)

### Client Events
- `post:join` - Join post room for real-time updates
- `post:leave` - Leave post room
- `comment:typing` - Typing indicator for comments
- `notifications:read` - Mark notifications as read

### Server Events
- `notification:new` - New notification received
- `comment:new` - New comment on post
- `like:new` - New like on post
- `user:online` - User came online
- `user:offline` - User went offline
- `online:count` - Current online users count

## Features

### Performance Optimizations
- Redis caching for feeds and sessions
- Database indexes for fast queries
- Compression middleware
- Rate limiting
- Connection pooling

### Security Features
- Helmet.js security headers
- CORS configuration
- JWT authentication
- Input validation
- SQL injection prevention

### Monitoring & Logging
- Winston structured logging
- Error tracking
- Performance monitoring
- Health check endpoint

### Real-time Features
- Socket.io for live updates
- Online user tracking
- Real-time notifications
- Typing indicators

## Development Guidelines

### Error Handling
All routes use the global error handler that:
- Logs errors with context
- Returns consistent error format
- Handles Prisma and JWT errors
- Sanitizes errors in production

### Database Queries
- Use Prisma for type-safe queries
- Implement proper indexes
- Use transactions for data consistency
- Cache frequently accessed data

### Real-time Updates
- Authenticate socket connections
- Use rooms for targeted updates
- Handle connection errors gracefully
- Track online users efficiently

## Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Strong JWT secrets
- Production database URL
- Redis connection string
- Cloudinary credentials

### Database
- Run migrations instead of db:push
- Set up connection pooling
- Configure backup strategy
- Monitor query performance

### Caching
- Configure Redis for production
- Set appropriate cache TTLs
- Monitor cache hit rates
- Handle Redis failures gracefully

### Monitoring
- Set up log aggregation
- Monitor error rates
- Track API performance
- Set up health checks

## Next Steps

This server foundation is ready for:
- Phase 3: Authentication system implementation
- Phase 4: Posts and feed API development
- Phase 5: Real-time notifications
- Phases 6-10: Mobile app integration