"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.percentEncode = percentEncode;
exports.buildOAuthHeader = buildOAuthHeader;
exports.initiateOAuth = initiateOAuth;
exports.exchangeAccessToken = exchangeAccessToken;
exports.getAuthenticatedUser = getAuthenticatedUser;
const crypto_1 = __importDefault(require("crypto"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const USER_AGENT = 'WikiWish/1.0 (https://github.com/wikiwish; contact@wikimedia.org)';
const MEDIAWIKI_OAUTH_URL = 'https://meta.wikimedia.org/w/index.php';
function percentEncode(str) {
    return encodeURIComponent(str || '')
        .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}
function buildOAuthHeader(method, urlStr, oauthParams, consumerSecret, tokenSecret = '', bodyParams = {}) {
    const url = new URL(urlStr);
    const allParams = {};
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
    const signature = crypto_1.default.createHmac('sha1', signingKey).update(baseString).digest('base64');
    const headerParts = Object.keys(oauthParams)
        .sort()
        .map(k => `${k}="${percentEncode(oauthParams[k])}"`);
    headerParts.push(`oauth_signature="${percentEncode(signature)}"`);
    return `OAuth ${headerParts.join(', ')}`;
}
async function initiateOAuth() {
    const consumerKey = process.env.OAUTH_CONSUMER_KEY || '';
    const consumerSecret = process.env.OAUTH_CONSUMER_SECRET || '';
    const callbackUrl = process.env.OAUTH_CALLBACK_URL || 'http://localhost:8080/api/auth/callback';
    if (!consumerKey || !consumerSecret) {
        throw new Error('OAuth consumer key or secret is missing from environment variables');
    }
    const sendInitiateRequest = async (cb) => {
        const initiateUrl = `${MEDIAWIKI_OAUTH_URL}?title=Special:OAuth/initiate`;
        const nonce = crypto_1.default.randomBytes(16).toString('hex');
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
        const response = await (0, node_fetch_1.default)(initiateUrl, {
            method: 'POST',
            headers: {
                'User-Agent': USER_AGENT,
                'Authorization': authHeader,
            },
        });
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
    const authorizeUrl = `https://meta.wikimedia.org/wiki/Special:OAuth/authorize?oauth_token=${encodeURIComponent(oauthToken)}&oauth_consumer_key=${encodeURIComponent(consumerKey)}`;
    return {
        oauth_token: oauthToken,
        oauth_token_secret: oauthTokenSecret,
        authorizeUrl,
    };
}
async function exchangeAccessToken(requestToken, verifier, requestTokenSecret) {
    const consumerKey = process.env.OAUTH_CONSUMER_KEY || '';
    const consumerSecret = process.env.OAUTH_CONSUMER_SECRET || '';
    const tokenUrl = `${MEDIAWIKI_OAUTH_URL}?title=Special:OAuth/token`;
    const nonce = crypto_1.default.randomBytes(16).toString('hex');
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
    const response = await (0, node_fetch_1.default)(tokenUrl, {
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
async function getAuthenticatedUser(accessToken) {
    const consumerKey = process.env.OAUTH_CONSUMER_KEY || '';
    const consumerSecret = process.env.OAUTH_CONSUMER_SECRET || '';
    const identifyUrl = `${MEDIAWIKI_OAUTH_URL}?title=Special:OAuth/identify`;
    const nonce = crypto_1.default.randomBytes(16).toString('hex');
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
    const response = await (0, node_fetch_1.default)(identifyUrl, {
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
//# sourceMappingURL=oauth.js.map