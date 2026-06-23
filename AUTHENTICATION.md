# JWT Authentication Guide

This document provides a comprehensive guide to the production-level JWT authentication system implemented in this Next.js application.

## Overview

The authentication system uses JWT (JSON Web Tokens) with the following features:

- **Role-Based Access Control (RBAC)**: Support for `admin` and `user` roles
- **Token Expiry**: Short-lived access tokens (15 min) and long-lived refresh tokens (7 days)
- **Secure Password Hashing**: bcryptjs with salt (10 rounds)
- **HttpOnly Cookies**: Refresh tokens stored securely in httpOnly cookies
- **Protected Routes**: Admin-only route protection for sensitive operations

## Setup

### 1. Install Dependencies

```bash
npm install jsonwebtoken bcryptjs dotenv
npm install -D @types/jsonwebtoken
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# JWT Secrets (generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your_64_character_random_string
JWT_REFRESH_SECRET=your_64_character_random_string

# Token Expiry
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Admin Secret (for creating admin accounts)
ADMIN_SECRET=your_admin_secret_string

# Other configurations...
```

**⚠️ Security Note**: Never commit `.env.local` to version control. Keep secrets secure and rotate them regularly.

## API Endpoints

### Authentication Routes

#### Register a User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "adminSecret": "your_admin_secret" // Optional - omit for regular user
}
```

**Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200)**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note**: Refresh token is set in secure httpOnly cookie automatically.

#### Refresh Access Token
```http
POST /api/auth/refresh
```

**Response (200)**:
```json
{
  "message": "Access token refreshed",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout
```http
POST /api/auth/logout
```

**Response (200)**:
```json
{
  "message": "Logout successful"
}
```

### Protected Routes

#### Create Event (Admin Only)
```http
POST /api/events
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data

{
  "title": "React Workshop",
  "description": "Learn React fundamentals...",
  "overview": "Beginner-friendly React workshop",
  "image": <file>,
  "venue": "Tech Hub",
  "location": "New York",
  "date": "2024-12-15",
  "time": "10:00 AM",
  "mode": "offline",
  "audience": "Beginners",
  "tags": "[\"react\", \"javascript\"]",
  "agenda": "[\"Introduction\", \"Components\", \"Hooks\"]",
  "organizer": "Tech Community"
}
```

**Authorization Header**: `Authorization: Bearer <your_access_token>`

**Responses**:
- `201`: Event created successfully
- `401`: Missing or invalid token
- `403`: User is not admin

## Client Implementation

### JavaScript/TypeScript Example

```typescript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important for cookies
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
  }),
});

const { accessToken } = await loginResponse.json();

// Store access token in memory or localStorage
// Refresh token is automatically in httpOnly cookie

// Create event with admin access
const eventResponse = await fetch('/api/events', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
  credentials: 'include',
  body: formData,
});

// Refresh token when access token expires
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include', // Sends refresh token cookie
});

const { accessToken: newToken } = await refreshResponse.json();
```

## Middleware & Utilities

### Authentication Middleware

Located in `lib/authMiddleware.ts`:

```typescript
// Authenticate and get user
const { user, error } = await authenticateToken(request);
if (error) return error;

// Check admin role
const adminError = requireAdmin(user);
if (adminError) return adminError;
```

### JWT Utilities

Located in `lib/jwt.ts`:

- `generateAccessToken()`: Create short-lived access token
- `generateRefreshToken()`: Create long-lived refresh token
- `generateTokens()`: Generate both tokens
- `verifyAccessToken()`: Verify and decode access token
- `verifyRefreshToken()`: Verify and decode refresh token
- `extractTokenFromHeader()`: Extract Bearer token from header

## Token Structure

### Access Token Payload
```json
{
  "userId": "user_id",
  "email": "user@example.com",
  "role": "admin",
  "iat": 1234567890,
  "exp": 1234569690
}
```

### Refresh Token Payload
Same as access token but with longer expiration.

## Security Best Practices

✅ **Implemented**:
- Password hashing with bcryptjs (10 salt rounds)
- Secure httpOnly cookies for refresh tokens
- Short-lived access tokens (15 minutes)
- CORS protection with sameSite='strict'
- Token verification with algorithm validation
- Environment variable security

### Additional Recommendations:

1. **HTTPS Only**: Always use HTTPS in production
2. **Rate Limiting**: Implement rate limiting on auth endpoints
   ```typescript
   // Use packages like express-rate-limit or custom middleware
   ```

3. **Token Blacklisting**: For logout, maintain a token blacklist
   ```typescript
   // Store revoked tokens in Redis with expiry
   ```

4. **CSRF Protection**: Implement CSRF tokens for form submissions

5. **Input Validation**: Always validate and sanitize input

6. **Logging & Monitoring**: Log authentication events
   ```typescript
   console.log(`Login attempt from ${email}`);
   ```

7. **Password Requirements**: Enforce strong password policies
   - Minimum 8 characters (currently implemented)
   - Uppercase, lowercase, numbers, special chars (optional)

## Database Models

### User Model

Location: `database/user.model.ts`

```typescript
interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes Created Automatically**:
- `email`: Unique, lowercase, trimmed
- `timestamps`: createdAt, updatedAt

**Methods**:
- `comparePassword(password)`: Verify password hash

## Testing with cURL

```bash
# Register admin
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!",
    "name": "Admin User",
    "adminSecret": "your_admin_secret"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123!"
  }'

# Create event (replace TOKEN)
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer TOKEN" \
  -F "title=React Workshop" \
  -F "description=Learn React" \
  -F "overview=Beginner workshop" \
  -F "image=@image.jpg" \
  -F "venue=Tech Hub" \
  -F "location=New York" \
  -F "date=2024-12-15" \
  -F "time=10:00 AM" \
  -F "mode=offline" \
  -F "audience=Beginners" \
  -F "tags=[\"react\"]" \
  -F "agenda=[\"Intro\"]" \
  -F "organizer=Community"
```

## Troubleshooting

### "JWT_SECRET must be defined"
- Ensure `.env.local` has `JWT_SECRET` and `JWT_REFRESH_SECRET`

### "Invalid token" error
- Verify token format is `Bearer <token>`
- Check token hasn't expired
- Ensure correct secret is used

### Password comparison fails
- Verify password hashing completed before comparison
- Check database user record exists

### Cookies not being set
- Enable credentials in fetch: `credentials: 'include'`
- Ensure HTTPS in production

## Advanced: Token Refresh Flow

```
Client                           Server
  |                               |
  |--1. POST /api/auth/login----->|
  |                               | - Verify credentials
  |<-----accessToken + refresh----|  (in httpOnly cookie)
  |
  |--2. Use accessToken---------->|
  |     to access resources       |
  |                               |
  | [15 minutes later]            |
  | Token expires                 |
  |                               |
  |--3. POST /api/auth/refresh--->|
  |     (with refresh cookie)     |
  |<-----new accessToken----------|
  |
  |--4. Continue using----------->|
  |     new token                 |
```

## Rotating Secrets

If you need to rotate JWT secrets:

```bash
# Generate new secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
JWT_SECRET=new_secret_here
JWT_REFRESH_SECRET=new_refresh_secret

# Restart application
# Users will need to login again (existing tokens become invalid)
```

## Monitoring & Logs

Check these areas for authentication issues:

1. **Server Logs**: Watch for token verification failures
2. **Network Tab**: Verify Authorization headers are sent
3. **Cookies**: Check refresh token is stored in httpOnly cookies
4. **MongoDB**: Verify user records with correct fields

## Support

For issues or questions:
1. Check this documentation
2. Review error messages carefully
3. Check server console logs
4. Verify environment variables are set correctly

---

**Last Updated**: 2024
**Version**: 1.0.0
