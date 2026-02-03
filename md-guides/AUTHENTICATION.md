# Facebook Clone - Authentication System

Complete JWT-based authentication system with registration, login, token refresh, and security features.

## Features

### 🔐 Core Authentication
- **User Registration** - Create new accounts with validation
- **User Login** - Email or username login support
- **JWT Tokens** - Access tokens (15min) + Refresh tokens (7 days)
- **Token Refresh** - Seamless token renewal
- **Secure Logout** - Token invalidation
- **Password Change** - Secure password updates

### 🛡️ Security Features
- **Password Hashing** - bcrypt with 12 salt rounds
- **Rate Limiting** - Prevent brute force attacks
- **Input Validation** - Comprehensive Joi validation
- **Token Security** - Separate secrets for access/refresh tokens
- **Session Management** - Redis caching with automatic cleanup
- **CORS Protection** - Configurable cross-origin policies

### 📊 Performance Optimizations
- **Redis Caching** - User sessions cached for fast lookups
- **Database Indexes** - Optimized queries for auth operations
- **Connection Pooling** - Efficient database connections
- **Graceful Degradation** - Works without Redis (slower)

## API Endpoints

### Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username123",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "clr123...",
      "email": "user@example.com",
      "username": "username123",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "user@example.com", // or username
  "password": "SecurePass123"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "clr123...",
      "email": "user@example.com",
      "username": "username123",
      "firstName": "John",
      "lastName": "Doe",
      "bio": null,
      "avatar": null,
      "isVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "postsCount": 5,
      "followersCount": 10,
      "followingCount": 8
    }
  }
}
```

### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <access_token>
```

## Validation Rules

### Email
- Valid email format
- Maximum 255 characters
- Automatically converted to lowercase
- Must be unique

### Username
- 3-30 characters
- Alphanumeric only
- Automatically converted to lowercase
- Must be unique

### Password
- Minimum 6 characters
- Maximum 128 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Names (First/Last)
- 1-50 characters
- Letters and spaces only
- Automatically trimmed

## Security Implementation

### Password Security
```javascript
// Hashing with bcrypt (12 salt rounds)
const hashedPassword = await bcrypt.hash(password, 12);

// Comparison
const isValid = await bcrypt.compare(password, hashedPassword);
```

### JWT Token Structure
```javascript
// Access Token (15 minutes)
{
  "userId": "clr123...",
  "type": "access",
  "iat": 1640995200,
  "exp": 1640996100
}

// Refresh Token (7 days)
{
  "userId": "clr123...",
  "type": "refresh",
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Rate Limiting
- **Login**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per hour per IP
- **General API**: 100 requests per 15 minutes per IP

### Session Caching
```javascript
// Redis session structure
{
  "id": "clr123...",
  "email": "user@example.com",
  "username": "username123",
  "firstName": "John",
  "lastName": "Doe",
  "avatar": null,
  "isVerified": false
}
```

## Middleware Usage

### Authentication Middleware
```javascript
const { authenticate } = require('../middleware/auth');

// Protect routes
router.get('/protected', authenticate, (req, res) => {
  // req.user contains authenticated user data
  res.json({ user: req.user });
});
```

### Optional Authentication
```javascript
const { optionalAuth } = require('../middleware/auth');

// Optional auth (user attached if token provided)
router.get('/public', optionalAuth, (req, res) => {
  // req.user exists if authenticated, undefined otherwise
  const isAuthenticated = !!req.user;
  res.json({ isAuthenticated });
});
```

### Ownership Validation
```javascript
const { requireOwnership } = require('../middleware/auth');

// Ensure user owns the resource
router.delete('/posts/:id', 
  authenticate, 
  requireOwnership('id', 'post'),
  deletePost
);
```

## Error Handling

### Common Error Responses

**Validation Error (400)**
```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

**Authentication Error (401)**
```json
{
  "status": "error",
  "message": "Access token required",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Duplicate User (409)**
```json
{
  "status": "error",
  "message": "Email already registered",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Rate Limit (429)**
```json
{
  "status": "error",
  "message": "Too many authentication attempts. Try again in 10 minutes.",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing

### Run Authentication Tests
```bash
# Run the comprehensive test suite
node src/scripts/testAuth.js
```

### Test Coverage
- ✅ User registration (success & validation)
- ✅ Duplicate registration prevention
- ✅ Login with email/username
- ✅ Invalid login rejection
- ✅ Token-based authentication
- ✅ Unauthorized access prevention
- ✅ Token refresh mechanism
- ✅ Password change functionality
- ✅ Secure logout with token invalidation
- ✅ Input validation for all fields

### Sample Test Output
```
🚀 Starting Authentication System Tests...
📡 API URL: http://localhost:5000/api

🧪 Testing User Registration...
✅ Registration successful
   User ID: clr123...
   Username: testuser123
   Email: test@example.com

🧪 Testing User Login...
✅ Email login successful
✅ Username login successful

📊 Test Results:
✅ Passed: 10
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 All tests passed! Authentication system is working correctly.
```

## Database Seeding

### Create Sample Data
```bash
# Seed database with sample users and data
npm run db:seed
```

### Sample Users Created
- **john.doe@example.com** / password123
- **jane.smith@example.com** / password123
- **mike.johnson@example.com** / password123
- **sarah.wilson@example.com** / password123
- **alex.brown@example.com** / password123

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here-make-it-different
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/facebook_clone"

# Redis (optional - for caching)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## Production Considerations

### Security Checklist
- ✅ Strong JWT secrets (256-bit minimum)
- ✅ HTTPS only in production
- ✅ Secure cookie settings
- ✅ Rate limiting configured
- ✅ Input validation on all endpoints
- ✅ Password complexity requirements
- ✅ Account lockout after failed attempts
- ✅ Session timeout handling

### Performance Optimizations
- ✅ Redis caching for user sessions
- ✅ Database connection pooling
- ✅ Optimized database queries with indexes
- ✅ Compression middleware
- ✅ Graceful error handling

### Monitoring
- ✅ Authentication success/failure rates
- ✅ Token refresh frequency
- ✅ Rate limit violations
- ✅ Failed login attempts
- ✅ Session cache hit rates

## Next Steps

The authentication system is now complete and ready for:
- **Phase 4**: Posts & Feed API implementation
- **Phase 5**: Real-time notifications
- **Phase 6**: Mobile app integration

All authentication endpoints are fully functional, tested, and production-ready with comprehensive security measures and performance optimizations.