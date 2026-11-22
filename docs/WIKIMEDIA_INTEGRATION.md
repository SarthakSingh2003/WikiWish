# Wikimedia Integration

This document describes how WikiWish integrates with Wikimedia APIs and infrastructure.

## API Endpoints

### Community Wishlist List

**Endpoint**: `https://meta.wikimedia.org/w/api.php`

**Method**: GET

**Query**:
```
action=query
list=communityrequests-wishes
crwlimit=50
format=json
```

**Response Structure**:
```json
{
  "query": {
    "communityrequests-wishes": [
      {
        "id": 12345678,
        "status": "under-review",
        "type": "feature",
        "title": "Wishlist Title",
        "tags": ["reading", "large-wikipedias"],
        "votecount": 42,
        "created": "2026-11-09T05:08:27Z",
        "updated": "2026-11-19T18:24:32Z",
        "crwns": 0,
        "crwtitle": "Community Wishlist/W123"
      }
    ]
  }
}
```

### Wish Details (HTML Parsing)

**Endpoint**: `https://meta.wikimedia.org/w/api.php`

**Method**: GET

**Query**:
```
action=parse
page=Community_Wishlist/W930
prop=text
format=json
```

**Extracted from HTML Response**:

1. **Author**: Found in `ext-communityrequests-wish--proposer` class
2. **Description**: Found in `ext-communityrequests-wish--description` class
3. **Tags**: Found in `ext-communityrequests-wish--tags` class
4. **Supporters**: Found in `ext-communityrequests-vote-entry` divs

## Data Model

### WikiWish Interface

```typescript
interface WikiWish {
  id: number;              // Unique identifier
  status: string;          // under-review, completed, etc.
  type: string;            // feature, change, unknown
  title: string;           // Wish title
  description: string;       // Full description
  tags: string[];          // Classification tags
  focusArea: string;       // Affected area
  votecount: number;       // Number of supporters
  created: string;         // ISO timestamp
  updated: string;         // ISO timestamp
  author?: string;         // Creator username
  supporters?: Supporter[]; // List of supporters
}

interface Supporter {
  username: string;        // Supporter's username
  timestamp: string;       // When they supported
}
```

## Wiki API Etiquette

WikiWish follows Wikimedia API best practices:

1. **User-Agent**: `WikiWish/1.0 (https://github.com/wikiwish; contact@wikimedia.org)`
2. **Rate Limiting**: Max 3 concurrent requests, 100ms minimum interval
3. **Caching**: API responses cached client-side (5 minutes)
4. **Pagination**: Use continue tokens for large result sets
5. **Error Handling**: Handle HTTP 429 with exponential backoff

## OAuth Integration

WikiWish uses Wikimedia OAuth 1.0a for authentication.

### OAuth Flow

1. **Consumer Registration**: Tool must be registered at Special:OAuthConsumerRegistration/propose
2. **Authorization**: User redirected to Meta-Wiki OAuth
3. **Callback**: Token sent to configured callback URL
4. **Access Token**: Exchange request token for access token

### Required OAuth Credentials

- **Consumer Key**: Obtained from OAuth registration
- **Consumer Secret**: Keep secure, never expose in frontend
- **Callback URL**: Must match registered URL (e.g., https://your-tool.org/api/auth/callback)

### Minimal Scopes

- Read access to user contributions
- User identity (username, display name)

## Authentication Endpoints

### Login Initiation

```
GET /api/auth/login
```

Redirects user to Meta-Wiki OAuth authorization page.

### OAuth Callback

```
GET /api/auth/callback
?oauth_token=...
&oauth_verifier=...
&oauth_state=...
```

Handles OAuth callback, exchanges tokens, creates session.

### Session Check

```
GET /api/auth/me
```

Returns authenticated user info.

Response:
```json
{
  "user": {
    "username": "Nardog",
    "displayName": "Nardog"
  }
}
```

### Logout

```
POST /api/auth/logout
```

Destroys session and clears OAuth state.

## Toolforge Deployment

For Toolforge deployment, additional considerations:

1. **Grid Engine**: Use `toolforge` namespace for services
2. **Webservice Command**:
   ```
   toolforge webservice --site=meta-wiki start
   ```
3. **Environment Variables**: Set via `toolforge env` commands
4. **Database**: Use Toolforge databases for persistent storage (if needed)
5. **URL**: Accessible at `https://tools.wmflabs.org/~yourtoolname/`

## Privacy and Compliance

1. **Data Collection**: Only public Meta-Wiki data
2. **Token Storage**: OAuth tokens stored in session, not persisted
3. **No Personal Data**: No collection of private user information
4. **Public Endpoints**: All endpoints respond to anonymous requests for public data
5. **Cookie Policy**: Standard session cookie, no tracking cookies