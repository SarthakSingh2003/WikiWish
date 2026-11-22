import crypto from 'crypto';
import fetch from 'node-fetch';

const USER_AGENT = 'WikiWish/1.0 (https://github.com/wikiwish; contact@wikimedia.org)';
const MEDIAWIKI_OAUTH_URL = 'https://meta.wikimedia.org/w/index.php';

export interface OAuthTokens {
  key: string;
  secret: string;
}

export interface AuthenticatedUser {
  username: string;
  displayName: string;
  editcount?: number;
}

export function percentEncode(str: string): string {
  return encodeURIComponent(str || '')
    .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

export function buildOAuthHeader(
  method: string,
  urlStr: string,
  oauthParams: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = '',
  bodyParams: Record<string, string> = {}
): string {
  const url = new URL(urlStr);
  const allParams: Record<string, string> = {};

  for (const [k, v] of url.searchParams.entries()) {
    allParams[k] = v;
  }
  for (const [k, v] of Object.entries(bodyParams)) {
    allParams[k] = v;
  }
  for (const [k, v] of Object.entries(oauthParams)) {
    allParams[k] = v;
  }

  const sortedKeys = Object.keys(allParams).sort();
  const paramPairs = sortedKeys.map(k => `${percentEncode(k)}=${percentEncode(allParams[k])}`);
  const paramString = paramPairs.join('&');

  const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
  const baseString = `${method.toUpperCase()}&${percentEncode(baseUrl)}&${percentEncode(paramString)}`;

  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const signature = crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');

  const headerParts = Object.keys(oauthParams)
    .sort()
    .map(k => `${k}="${percentEncode(oauthParams[k])}"`);
  headerParts.push(`oauth_signature="${percentEncode(signature)}"`);

  return `OAuth ${headerParts.join(', ')}`;
}

export async function initiateOAuth(): Promise<{
  oauth_token: string;
  oauth_token_secret: string;
  authorizeUrl: string;
}> {
  const consumerKey = process.env.OAUTH_CONSUMER_KEY || '';
  const consumerSecret = process.env.OAUTH_CONSUMER_SECRET || '';
  const callbackUrl = process.env.OAUTH_CALLBACK_URL || 'http://localhost:8080/api/auth/callback';

  if (!consumerKey || !consumerSecret) {
    throw new Error('OAuth consumer key or secret is missing from environment variables');
  }

  const initiateUrl = `${MEDIAWIKI_OAUTH_URL}?title=Special:OAuth/initiate`;
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_callback: callbackUrl,
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_version: '1.0',
  };

  const authHeader = buildOAuthHeader('POST', initiateUrl, oauthParams, consumerSecret, '');

  const response = await fetch(initiateUrl, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Authorization': authHeader,
    },
  });

  const bodyText = await response.text();

  if (!response.ok || bodyText.startsWith('Error:')) {
    throw new Error(`Wikimedia OAuth initiate failed: ${bodyText}`);
  }

  const params = new URLSearchParams(bodyText);
  const oauthToken = params.get('oauth_token');
  const oauthTokenSecret = params.get('oauth_token_secret');

  if (!oauthToken || !oauthTokenSecret) {
    throw new Error(`Failed to parse OAuth initiate response: ${bodyText}`);
  }

  const authorizeUrl = `https://meta.wikimedia.org/wiki/Special:OAuth/authorize?oauth_token=${encodeURIComponent(
    oauthToken
  )}&oauth_consumer_key=${encodeURIComponent(consumerKey)}`;

  return {
    oauth_token: oauthToken,
    oauth_token_secret: oauthTokenSecret,
    authorizeUrl,
  };
}

export async function exchangeAccessToken(
  requestToken: string,
  verifier: string,
  requestTokenSecret: string
): Promise<OAuthTokens> {
  const consumerKey = process.env.OAUTH_CONSUMER_KEY || '';
  const consumerSecret = process.env.OAUTH_CONSUMER_SECRET || '';

  const tokenUrl = `${MEDIAWIKI_OAUTH_URL}?title=Special:OAuth/token`;
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: requestToken,
    oauth_verifier: verifier,
    oauth_version: '1.0',
  };

  const authHeader = buildOAuthHeader('POST', tokenUrl, oauthParams, consumerSecret, requestTokenSecret);

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Authorization': authHeader,
    },
  });

  const bodyText = await response.text();

  if (!response.ok || bodyText.startsWith('Error:')) {
    throw new Error(`Wikimedia OAuth token exchange failed: ${bodyText}`);
  }

  const params = new URLSearchParams(bodyText);
  const accessTokenKey = params.get('oauth_token');
  const accessTokenSecret = params.get('oauth_token_secret');

  if (!accessTokenKey || !accessTokenSecret) {
    throw new Error(`Failed to parse access token response: ${bodyText}`);
  }

  return {
    key: accessTokenKey,
    secret: accessTokenSecret,
  };
}

export async function getAuthenticatedUser(accessToken: OAuthTokens): Promise<AuthenticatedUser> {
  const consumerKey = process.env.OAUTH_CONSUMER_KEY || '';
  const consumerSecret = process.env.OAUTH_CONSUMER_SECRET || '';

  const identifyUrl = `${MEDIAWIKI_OAUTH_URL}?title=Special:OAuth/identify`;
  const nonce = crypto.randomBytes(16).toString('hex');
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: accessToken.key,
    oauth_version: '1.0',
  };

  const authHeader = buildOAuthHeader('GET', identifyUrl, oauthParams, consumerSecret, accessToken.secret);

  const response = await fetch(identifyUrl, {
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      'Authorization': authHeader,
    },
  });

  const bodyText = await response.text();

  if (!response.ok || bodyText.startsWith('Error:')) {
    throw new Error(`Wikimedia identify failed: ${bodyText}`);
  }

  // Identify endpoint returns a signed JWT token: header.payload.signature
  const jwtParts = bodyText.split('.');
  if (jwtParts.length >= 2) {
    const payloadJson = Buffer.from(jwtParts[1], 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson);
    const username = payload.username || payload.sub;
    return {
      username,
      displayName: username,
      editcount: payload.editcount,
    };
  }

  throw new Error(`Unexpected identify payload format from Wikimedia: ${bodyText.slice(0, 100)}`);
}
