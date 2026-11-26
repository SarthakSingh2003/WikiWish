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

  const sendInitiateRequest = async (cb: string) => {
    const initiateUrl = `${MEDIAWIKI_OAUTH_URL}?title=Special:OAuth/initiate`;
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000).toString();

    const oauthParams = {
      oauth_callback: cb,
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
    };

    const authHeader = buildOAuthHeader('POST', initiateUrl, oauthParams, consumerSecret, '');

    const fetchFn = typeof globalThis.fetch === 'function' ? globalThis.fetch : fetch;
    const response = await fetchFn(initiateUrl, {
      method: 'POST',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Encoding': 'identity',
        'Authorization': authHeader,
      },
    } as any);

    const bodyText = await response.text();
    return { ok: response.ok, bodyText };
  };

  let result = await sendInitiateRequest(callbackUrl);

  // If MediaWiki requires "oob" because the callback URL was registered statically in the consumer
  if (!result.ok && result.bodyText.includes('oauth_callback must be set, and must be set to') && callbackUrl !== 'oob') {
    result = await sendInitiateRequest('oob');
  }

  if (!result.ok || result.bodyText.startsWith('Error:')) {
    throw new Error(`Wikimedia OAuth initiate failed: ${result.bodyText}`);
  }

  const params = new URLSearchParams(result.bodyText);
  const oauthToken = params.get('oauth_token');
  const oauthTokenSecret = params.get('oauth_token_secret');

  if (!oauthToken || !oauthTokenSecret) {
    throw new Error(`Failed to parse OAuth initiate response: ${result.bodyText}`);
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

  const fetchFn = typeof globalThis.fetch === 'function' ? globalThis.fetch : fetch;
  const response = await fetchFn(tokenUrl, {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'identity',
      'Authorization': authHeader,
    },
  } as any);

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
  const fetchFn = typeof globalThis.fetch === 'function' ? globalThis.fetch : fetch;

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

  try {
    const response = await fetchFn(identifyUrl, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Encoding': 'identity',
        'Authorization': authHeader,
      },
    } as any);

    const bodyText = await response.text();

    if (response.ok && !bodyText.startsWith('Error:')) {
      // Identify endpoint returns a signed JWT token: header.payload.signature
      const jwtParts = bodyText.split('.');
      if (jwtParts.length >= 2) {
        const payloadJson = Buffer.from(jwtParts[1], 'base64url').toString('utf8');
        const payload = JSON.parse(payloadJson);
        const username = payload.username || payload.sub;
        if (username) {
          return {
            username,
            displayName: username,
            editcount: payload.editcount,
          };
        }
      }
    }
  } catch (err: any) {
    console.warn('Special:OAuth/identify failed, attempting meta=userinfo fallback:', err.message);
  }

  // Resilient Fallback: Query MediaWiki API action=query&meta=userinfo with OAuth Authorization header
  try {
    const userinfoUrl = 'https://meta.wikimedia.org/w/api.php?action=query&meta=userinfo&format=json';
    const nonceFallback = crypto.randomBytes(16).toString('hex');
    const tsFallback = Math.floor(Date.now() / 1000).toString();
    const oauthParamsFallback = {
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonceFallback,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: tsFallback,
      oauth_token: accessToken.key,
      oauth_version: '1.0',
    };
    const authHeaderFallback = buildOAuthHeader('GET', userinfoUrl, oauthParamsFallback, consumerSecret, accessToken.secret);

    const responseFallback = await fetchFn(userinfoUrl, {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Encoding': 'identity',
        'Authorization': authHeaderFallback,
      },
    } as any);

    const dataFallback = await responseFallback.json() as any;
    const userObj = dataFallback?.query?.userinfo;
    if (userObj?.name) {
      return {
        username: userObj.name,
        displayName: userObj.name,
        editcount: userObj.editcount,
      };
    }
  } catch (errFallback: any) {
    console.error('Fallback meta=userinfo error:', errFallback);
  }

  throw new Error('Could not identify authenticated Wikimedia user from access token.');
}
