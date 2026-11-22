# WikiWish API Reference

This document describes all API endpoints provided by WikiWish.

## Authentication Endpoints

### GET /api/auth/login

Initiate OAuth login flow.

**Response**: Redirects to Wikimedia OAuth

---

### GET /api/auth/callback

Handle OAuth callback from Wikimedia.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| oauth_token | string | Yes | OAuth request token |
| oauth_verifier | string | Yes | OAuth verifier code |
| oauth_state | string | Yes | OAuth state for CSRF protection |

**Response**: Redirects to `/dashboard` on success, error JSON on failure.

---

### GET /api/auth/me

Get current authenticated user.

**Authentication**: Session cookie required

**Response**:
```json
{
  "user": {
    "username": "Nardog",
    "displayName": "Nardog"
  }
}
```

**Status Codes**:
- 200: Success
- 401: Not authenticated

---

### POST /api/auth/logout

Logout current user.

**Response**:
```json
{ "message": "Logged out successfully" }
```

---

## User Endpoints

### GET /api/users/:username

Get user's wishlist statistics and wishes.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| username | string | Wikimedia username |

**Response**:
```json
{
  "username": "Nardog",
  "created": [WikiWish[]],
  "supported": [WikiWish[]],
  "statistics": {
    "created": 5,
    "supported": 12
  }
}
```

**Status Codes**:
- 200: Success
- 404: User not found
- 500: Server error

---

### GET /api/users/:username/created

Get wishes created by user.

**Response**:
```json
{
  "wishes": [WikiWish[]]
}
```

---

### GET /api/users/:username/supported

Get wishes supported by user.

**Response**:
```json
{
  "wishes": [WikiWish[]]
}
```

---

## Wish Endpoints

### GET /api/wishes

List all wishes (paginated).

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of results (default: 50) |
| continue | string | No | Continue token for pagination |
| search | string | No | Search query |

**Response**:
```json
{
  "wishes": [WikiWish[]],
  "total": 100,
  "continue": "optional_continue_token"
}
```

---

### GET /api/wishes/:id

Get specific wish by ID.

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Wish ID |

**Response**:
```json
{
  "wish": WikiWish
}
```

**Status Codes**:
- 200: Success
- 404: Wish not found

---

### GET /api/wishes/search

Search wishes by query.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search query |
| limit | number | No | Number of results (default: 20) |

**Response**:
```json
{
  "wishes": [WikiWish[]]
}
```

---

## Health Endpoint

### GET /health

Check service health.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-22T01:00:00.000Z"
}
```

---

## WikiWish Data Model

### WikiWish Object

```json
{
  "id": 12345678,
  "status": "under-review",
  "type": "feature",
  "title": "Wishlist Title",
  "description": "Full wish description",
  "tags": ["reading", "large-wikipedias"],
  "focusArea": "Editing",
  "votecount": 42,
  "created": "2026-11-09T05:08:27Z",
  "updated": "2026-11-19T18:24:32Z",
  "author": "Username",
  "supporters": [
    {
      "username": "Supporter1",
      "timestamp": "21:26, 8 November 2026"
    }
  ]
}
```

### Wish Status Values

| Status | Description |
|--------|-------------|
| under-review | Wish is being reviewed |
| completed | Wish has been completed |
| declined | Wish was declined |
| needs-clarification | Additional details needed |
| community-opportunity | Identified as valuable |

## Error Responses

### Standard Error Format

```json
{
  "error": "Error message"
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | Not found |
| 500 | Internal server error |