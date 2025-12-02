# Gateway API Documentation

The API Gateway serves as the entry point for all client requests and routes them to the appropriate microservices.

## Base URL

```
Development: http://localhost:8080/api
Production: https://api.ai-smartlite.com
```

## Authentication

All API endpoints require authentication via JWT tokens or API keys.

### JWT Authentication

Include the JWT token in the Authorization header:

```http
Authorization: Bearer <token>
```

### API Key Authentication

Include the API key in the request header:

```http
X-API-Key: <api_key>
```

## Common Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm1abc123xyz",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login

Authenticate and receive access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "cm1abc123xyz",
      "email": "user@example.com",
      "username": "johndoe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Logout

Invalidate current session.

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## User Profile Endpoints

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1abc123xyz",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://example.com/avatar.jpg",
    "isActive": true,
    "isVerified": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### Update Profile

Update user profile information.

**Endpoint:** `PATCH /users/me`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "cm1abc123xyz",
    "firstName": "Jane",
    "lastName": "Smith",
    "avatar": "https://example.com/new-avatar.jpg"
  }
}
```

## API Key Management

### Create API Key

Generate a new API key.

**Endpoint:** `POST /api-keys`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Production API Key",
  "expiresAt": "2026-12-31T23:59:59Z"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "cm1key123xyz",
    "name": "Production API Key",
    "key": "sk_live_abc123def456ghi789",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "expiresAt": "2026-12-31T23:59:59Z"
  }
}
```

### List API Keys

Get all API keys for the current user.

**Endpoint:** `GET /api-keys`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "cm1key123xyz",
      "name": "Production API Key",
      "key": "sk_live_abc123...***",
      "lastUsedAt": "2025-12-01T10:30:00Z",
      "expiresAt": "2026-12-31T23:59:59Z",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Revoke API Key

Delete an API key.

**Endpoint:** `DELETE /api-keys/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "API key revoked successfully"
}
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

| Tier | Requests/Minute | Requests/Hour |
|------|-----------------|---------------|
| Free | 60 | 1000 |
| Basic | 300 | 10000 |
| Pro | 1000 | 50000 |
| Enterprise | Custom | Custom |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1640000000
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please try again later.",
    "retryAfter": 60
  }
}
```

## Webhooks (Coming Soon)

Configure webhooks to receive real-time notifications for events:
- Transcription completed
- TTS generation completed
- Pipeline execution completed
- Service errors

## API Versioning

The API uses URL versioning:
- Current: `/api/v1/...`
- Legacy: `/api/v0/...` (deprecated)

## CORS

CORS is enabled for the following origins:
- `http://localhost:3000` (development)
- `https://app.ai-smartlite.com` (production)

## Health Check

Check API availability.

**Endpoint:** `GET /health`

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-12-20T10:00:00Z",
  "services": {
    "database": "up",
    "redis": "up",
    "asr": "up",
    "tts": "up",
    "llm": "up",
    "pipeline": "up"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |
| `INTERNAL_ERROR` | Internal server error |

## SDK Support

Official SDKs are available for:
- JavaScript/TypeScript: `npm install @ai-smartlite/sdk`
- Python: `pip install ai-smartlite`
- Go: `go get github.com/ai-smartlite/go-sdk`
