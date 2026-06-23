# JWT Authentication - Quick Reference

## 1. Setup Environment

```bash
# Copy template
cp .env.example .env.local

# Generate secrets (run in Node):
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local with:
JWT_SECRET=<generated_secret>
JWT_REFRESH_SECRET=<generated_secret>
ADMIN_SECRET=<your_admin_secret>
```

## 2. Create Admin Account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123",
    "name": "Admin",
    "adminSecret": "your_admin_secret"
  }'
```

## 3. Login (Get Token)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPass123"
  }'
```

Response includes `accessToken`.

## 4. Create Event (Admin Only)

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer <accessToken>" \
  -F "title=My Event" \
  -F "description=..." \
  -F "image=@image.jpg" \
  ...
```

## 5. Frontend Usage

```typescript
import * as auth from '@/lib/authClient';

// Login
const { accessToken } = await auth.login('admin@example.com', 'password');

// Check if admin
if (auth.isAdmin()) {
  // Show create event form
}

// Create event
const formData = new FormData();
formData.append('title', 'Event Title');
// ... add other fields

await auth.createEvent(formData);

// Logout
await auth.logout();
```

## 6. Token Refresh (Automatic)

The `fetchWithAuth()` function automatically handles:
- Sending Authorization header
- Refreshing expired tokens
- Retrying failed requests

```typescript
const response = await auth.fetchWithAuth('/api/events');
```

## 7. Error Handling

```typescript
try {
  await auth.login(email, password);
} catch (error) {
  if (error.message.includes('Session expired')) {
    // Redirect to login
  }
}
```

## 8. Security Checklist

- [ ] Environment secrets in `.env.local` (never commit)
- [ ] HTTPS only in production
- [ ] httpOnly cookies enabled (automatic)
- [ ] Token expiry set correctly
- [ ] Admin secret protected
- [ ] Password validation enabled
- [ ] Rate limiting configured
- [ ] CORS configured

## 9. API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/register` | POST | No | Create new user |
| `/api/auth/login` | POST | No | Get access token |
| `/api/auth/refresh` | POST | Cookie | Refresh access token |
| `/api/auth/logout` | POST | Cookie | Clear session |
| `/api/events` | POST | Yes (Admin) | Create event |
| `/api/events` | GET | No | Fetch all events |
| `/api/events/[slug]` | GET | No | Get event details |

## 10. Debugging

```typescript
// Check current user
const user = auth.getCurrentUser();
console.log(user);

// Check if admin
console.log(auth.isAdmin());

// Check token expiry
console.log(auth.isTokenAboutToExpire());

// Get token
const token = auth.getAccessToken();
console.log(auth.decodeToken(token));
```

---

**Need help?** See [AUTHENTICATION.md](./AUTHENTICATION.md) for detailed documentation.
