# Authentication Guide

WikiWish uses Wikimedia OAuth 1.0a for authentication.

## OAuth Overview

WikiWish uses Wikimedia's official OAuth implementation to authenticate users. This provides:

- Secure, standards-compliant authentication
- Access to user identity (username, display name)
- No handling of Wikimedia passwords

## OAuth Flow

### 1. Login Initiation

User clicks "Sign in with Wikimedia" on the frontend.

### 2. Authorization Redirect

Backend redirects user to Meta-Wiki OAuth page:
```
https://meta.wikimedia.org/w/rest.php/oauth/authorize?
  oauth_callback=http://localhost:8080/api/auth/callback&
  oauth_consumer_key=YOUR_KEY&
  oauth_state=RANDOM_STATE
```

### 3. User Authorization

User reviews and grants permission to WikiWish.

### 4. OAuth Callback

Meta-Wiki redirects back to:
```
http://localhost:8080/api/auth/callback?
  oauth_token=REQUEST_TOKEN&
  oauth_verifier=VERIFIER_CODE&
  oauth_state=RANDOM_STATE
```

### 5. Access Token Exchange

Backend makes signed OAuth request to get access token:
```
POST https://meta.wikimedia.org/w/rest.php/oauth/access_token
```

### 6. Session Creation

Access token validated via `/oauth/identify` endpoint, session created.

## OAuth Setup

### Register Your Tool

1. Visit: https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose
2. Fill in the form:
   - **Description**: WikiWish - Community Wishlist tracker
   - **Callback URL**: Your deployment URL + `/api/auth/callback`
   - **Identity domains**: Leave blank
   - **Restrictions**: None

### Required Credentials

| Environment Variable | Description |
|---------------------|-------------|
| OAUTH_CONSUMER_KEY | Consumer key from OAuth registration |
| OAUTH_CONSUMER_SECRET | Consumer secret from OAuth registration |
| OAUTH_CALLBACK_URL | Must match registered callback URL |

## OAuth Permissions

WikiWish requests only minimal permissions:

- Read access to user contributions
- User identity (username, display name)

**Not requested**: Email, preferences, or editing rights.

## Session Management

### Session Storage

- OAuth tokens stored in encrypted session cookies
- 24-hour session lifetime
- HTTP-only, Secure flags (in production)

### Session Data Structure

```typescript
interface Session {
  user: {
    username: string;
    displayName: string;
    accessToken: string;
  };
  oauthState: string;
}
```

## Security Considerations

### Token Handling

- Access tokens are short-lived
- Never expose tokens in responses
- Store securely in session

### Session Security

- Use strong, random SESSION_SECRET
- Enable Secure cookie flag in production
- Set appropriate cookie domain

### OAuth State Validation

- State parameter prevents CSRF attacks
- State stored in session and validated on callback

### Logout

Logout endpoint destroys the session:
```
POST /api/auth/logout
```

## Testing OAuth Locally

1. Set sandbox callback: `http://localhost:8080/api/auth/callback`
2. Start backend: `npm run dev --prefix backend`
3. Start frontend: `npm run dev --prefix frontend`
4. Visit: http://localhost:3000
5. Click "Sign in with Wikimedia"

## Production Checklist

- [ ] OAuth credentials registered
- [ ] Callback URL uses HTTPS
- [ ] SESSION_SECRET is random and secure
- [ ] CORS origins configured for your domain
- [ ] HTTPS enforced for all traffic
- [ ] Secure cookie flags enabled
- [ ] Health check endpoint accessible

## Troubleshooting

### Redirect Loop

Ensure callback URL matches exactly what's registered in OAuth.

### Invalid OAuth State

Session may have expired. Try signing in again.

### Token Exchange Failed

Check consumer key/secret are correct and not expired.

### 401 Unauthorized

Session may have expired (24-hour max). Re-authenticate.