# JWT Authentication - Testing Guide

This guide provides comprehensive testing instructions for the JWT authentication system using various tools.

## Prerequisites

1. Application running: `npm run dev`
2. Environment variables configured in `.env.local`
3. MongoDB connection working

## Using cURL (Command Line)

### 1. Register Admin User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123",
    "name": "Admin User",
    "adminSecret": "your_admin_secret"
  }'
```

**Expected Response (201)**:
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id_here",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}
```

### 2. Login and Get Token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123"
  }'
```

Save the `accessToken` from response. The `-c cookies.txt` saves the refresh token cookie.

**Expected Response (200)**:
```json
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Create Event (Protected)

```bash
# Set token variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=React Workshop" \
  -F "description=Learn React fundamentals" \
  -F "overview=Beginner-friendly React workshop" \
  -F "image=@path/to/image.jpg" \
  -F "venue=Tech Hub" \
  -F "location=New York" \
  -F "date=2024-12-15" \
  -F "time=10:00 AM" \
  -F "mode=offline" \
  -F "audience=Beginners" \
  -F "tags=[\"react\",\"javascript\"]" \
  -F "agenda=[\"Introduction\",\"Components\",\"Hooks\"]" \
  -F "organizer=Tech Community"
```

### 4. Test Without Authorization (Should Fail)

```bash
curl -X POST http://localhost:3000/api/events \
  -F "title=React Workshop" \
  -F "description=Test" \
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

**Expected Response (401)**:
```json
{
  "message": "Access token is required",
  "error": "MISSING_TOKEN"
}
```

### 5. Test as Non-Admin User (Should Fail)

```bash
# Register regular user (without adminSecret)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "UserPassword123",
    "name": "Regular User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "UserPassword123"
  }'

# Try to create event with user token
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer <user_token>" \
  -F "title=Test" \
  -F "description=Test" \
  -F "image=@image.jpg" \
  -F "venue=Test" \
  -F "location=Test" \
  -F "date=2024-12-15" \
  -F "time=10:00 AM" \
  -F "mode=offline" \
  -F "audience=Test" \
  -F "tags=[\"test\"]" \
  -F "agenda=[\"Test\"]" \
  -F "organizer=Test"
```

**Expected Response (403)**:
```json
{
  "message": "Forbidden: Admin access required",
  "error": "NOT_ADMIN"
}
```

### 6. Refresh Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -b cookies.txt
```

**Expected Response (200)**:
```json
{
  "message": "Access token refreshed",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 7. Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

**Expected Response (200)**:
```json
{
  "message": "Logout successful"
}
```

## Using Postman

### 1. Create Collection

1. Open Postman
2. Create new collection: "DevEvent Auth"

### 2. Register Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/auth/register`
- **Headers**:
  - Content-Type: application/json
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "name": "Admin User",
  "adminSecret": "your_admin_secret"
}
```

### 3. Login Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/auth/login`
- **Headers**:
  - Content-Type: application/json
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "AdminPassword123"
}
```

**After response**: Copy `accessToken` value

### 4. Create Event Request

- **Method**: POST
- **URL**: `http://localhost:3000/api/events`
- **Headers**:
  - Authorization: `Bearer {{accessToken}}`
- **Body** (form-data):
  - title: React Workshop
  - description: Learn React
  - overview: Beginner workshop
  - image: (select file)
  - venue: Tech Hub
  - location: New York
  - date: 2024-12-15
  - time: 10:00 AM
  - mode: offline
  - audience: Beginners
  - tags: ["react"]
  - agenda: ["Intro"]
  - organizer: Community

### 5. Environment Variables in Postman

Create environment with:
- `accessToken`: (paste from login response)
- `baseUrl`: http://localhost:3000

Use in requests: `{{baseUrl}}/api/events`

## Using REST Client (VS Code Extension)

Create `test.http` file:

```http
### Register Admin
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPassword123",
  "name": "Admin User",
  "adminSecret": "your_admin_secret"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "AdminPassword123"
}

@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Create Event
POST http://localhost:3000/api/events
Authorization: Bearer {{token}}
Content-Type: multipart/form-data; boundary=----FormBoundary

------FormBoundary
Content-Disposition: form-data; name="title"

React Workshop
------FormBoundary
Content-Disposition: form-data; name="description"

Learn React fundamentals
------FormBoundary--

### Refresh Token
POST http://localhost:3000/api/auth/refresh

### Logout
POST http://localhost:3000/api/auth/logout
```

## Test Cases Table

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Register admin | 201 | | ☐ |
| Login with correct credentials | 200 + token | | ☐ |
| Login with wrong password | 401 | | ☐ |
| Create event as admin | 201 + event | | ☐ |
| Create event without token | 401 | | ☐ |
| Create event as regular user | 403 | | ☐ |
| Refresh token | 200 + new token | | ☐ |
| Logout | 200 | | ☐ |
| Get events (public) | 200 | | ☐ |
| Get event by slug (public) | 200 | | ☐ |

## Debugging Tips

### Check Token Content

```bash
# Decode token (in browser console or Node)
jwt_decode('token_here')
```

### Monitor Network Requests

1. Open DevTools (F12)
2. Go to Network tab
3. Perform authentication actions
4. Check:
   - Request headers (Authorization)
   - Response headers (Set-Cookie for refresh token)
   - Response body (accessToken)

### Check Cookies

```bash
# In browser console
console.log(document.cookie)

# Via cURL
curl -X POST http://localhost:3000/api/auth/login \
  -v  # Verbose mode to see cookies
```

### MongoDB Check

```bash
# Connect to MongoDB
mongosh

# Check users created
use devevent
db.users.find()

# Check events created
db.events.find()

# Check createdBy field
db.events.findOne({}, {createdBy: 1})
```

### Server Logs

Watch the terminal running `npm run dev`:

```
[AUTH] User login successful: admin@example.com
[JWT] Generated access token
[EVENT] Event created by: user_id
[ERROR] Authentication failed: Invalid token
```

## Common Issues & Solutions

### "JWT_SECRET must be defined"
**Solution**: Add to `.env.local`:
```env
JWT_SECRET=your_64_char_string
JWT_REFRESH_SECRET=your_64_char_string
```

### "Invalid email or password"
**Solution**: 
- Verify user exists: `db.users.findOne({email: 'test@example.com'})`
- Check email spelling
- Verify password hasn't been changed

### "Invalid or expired access token"
**Solution**:
- Token expires after 15 minutes
- Call refresh endpoint: `POST /api/auth/refresh`
- Check token format: `Bearer <token>` (with space)

### Cookies not being set
**Solution**:
- Use `credentials: 'include'` in fetch
- Verify `HTTPS` or `localhost` in production
- Check browser cookie settings

### 403 Forbidden on admin route
**Solution**:
- Verify user role: `db.users.findOne({email: 'test@example.com'}).role`
- Re-login or register with admin secret
- Check token hasn't been modified

## Performance Testing

### Load Test Registration

```bash
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"user$i@example.com\",
      \"password\": \"Password123\",
      \"name\": \"User $i\"
    }"
done
```

### Load Test Event Creation

```bash
TOKEN="your_token_here"

for i in {1..5}; do
  curl -X POST http://localhost:3000/api/events \
    -H "Authorization: Bearer $TOKEN" \
    -F "title=Event $i" \
    -F "description=Test event" \
    -F "image=@image.jpg" \
    -F "venue=Venue" \
    -F "location=Location" \
    -F "date=2024-12-15" \
    -F "time=10:00 AM" \
    -F "mode=offline" \
    -F "audience=All" \
    -F "tags=[\"test\"]" \
    -F "agenda=[\"Intro\"]" \
    -F "organizer=Org"
done
```

## Automated Testing

### Using Jest

```typescript
describe('Authentication', () => {
  it('should register a user', async () => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test',
      }),
    });
    expect(response.status).toBe(201);
  });

  it('should login and get token', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'AdminPassword123',
      }),
    });
    const data = await response.json();
    expect(data.accessToken).toBeDefined();
  });
});
```

---

**Last Updated**: 2024
**Version**: 1.0.0
