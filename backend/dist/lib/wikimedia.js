"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wikimediaClient = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const crypto_1 = __importDefault(require("crypto"));
const oauth_1 = require("./oauth");
const MEDIAWIKI_API_URL = 'https://meta.wikimedia.org/w/api.php';
const USER_AGENT = 'WikiWish/1.0 (https://github.com/wikiwish; contact@wikimedia.org)';
class WikimediaClient {
    lastRequestTime = 0;
    MIN_REQUEST_INTERVAL = 100;
    MAX_CONCURRENT = 3;
    currentConcurrent = 0;
    async rateLimit() {
        const now = Date.now();
        const timeSinceLast = now - this.lastRequestTime;
        if (timeSinceLast < this.MIN_REQUEST_INTERVAL) {
            await new Promise(resolve => setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLast));
        }
        while (this.currentConcurrent >= this.MAX_CONCURRENT) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        this.currentConcurrent++;
        this.lastRequestTime = Date.now();
    }
    releaseConcurrency() {
        this.currentConcurrent--;
    }
    async request(params, headers = {}) {
        await this.rateLimit();
        const url = new URL(MEDIAWIKI_API_URL);
        params.set('format', 'json');
        url.search = params.toString();
        let response;
        try {
            const fetchFn = typeof globalThis.fetch === 'function' ? globalThis.fetch : node_fetch_1.default;
            response = await fetchFn(url.toString(), {
                headers: {
                    'User-Agent': USER_AGENT,
                    'Accept-Encoding': 'identity',
                    ...headers,
                },
                compress: false,
                timeout: 15000,
            });
        }
        catch (error) {
            this.releaseConcurrency();
            throw error;
        }
        this.releaseConcurrency();
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
            throw new Error(`API Error: ${data.error.info || JSON.stringify(data.error)}`);
        }
        return data;
    }
    allWishesCache = null;
    allWishesCacheTime = 0;
    ALL_WISHES_TTL = 3 * 60 * 1000; // 3 minutes
    async fetchAllWishesFromMeta() {
        const now = Date.now();
        if (this.allWishesCache && (now - this.allWishesCacheTime) < this.ALL_WISHES_TTL) {
            return this.allWishesCache;
        }
        const allWishes = [];
        let continueToken = undefined;
        // Fetch in batches of 500 (MediaWiki maximum) to cover all Community Wishlist wishes
        for (let batch = 0; batch < 4; batch++) {
            const params = new URLSearchParams({
                action: 'query',
                list: 'communityrequests-wishes',
                crwlimit: '500',
                crwprop: 'tags|status|type|title|votecount|created|updated|description|focusarea',
            });
            if (continueToken) {
                params.set('crwcontinue', continueToken);
            }
            const data = await this.request(params);
            const rawWishes = data.query?.['communityrequests-wishes'] || data.query?.communityrequests_wishes || [];
            for (const w of rawWishes) {
                const normalizedStatus = w.status === 'done' ? 'completed' : (w.status || 'under-review');
                allWishes.push({
                    id: w.id,
                    status: normalizedStatus,
                    type: w.type || 'feature',
                    title: w.title || w.crwtitle || 'Untitled Wish',
                    tags: Array.isArray(w.tags) ? w.tags : [],
                    votecount: typeof w.votecount === 'number' ? w.votecount : 0,
                    created: w.created || new Date().toISOString(),
                    updated: w.updated || w.created || new Date().toISOString(),
                    crwns: w.crwns || 0,
                    crwtitle: w.crwtitle || `Community Wishlist/W${w.id}`,
                    description: w.description || '',
                    author: w.proposer || w.author,
                    focusArea: w.focusarea || w.focusArea,
                    supporters: w.supporters || [],
                });
            }
            continueToken = data.continue?.crwcontinue;
            if (!continueToken || rawWishes.length === 0) {
                break;
            }
        }
        this.allWishesCache = allWishes;
        this.allWishesCacheTime = now;
        return allWishes;
    }
    async getAllWishes(limit = 1000, continueToken) {
        const allWishes = await this.fetchAllWishesFromMeta();
        return {
            wishes: allWishes.slice(0, limit),
            ...(allWishes.length > limit ? { continue: 'more' } : {}),
        };
    }
    async getWishById(wishId) {
        const allWishes = await this.fetchAllWishesFromMeta();
        const wish = allWishes.find(w => w.id === wishId || w.crwtitle.toLowerCase() === `community wishlist/w${wishId}`);
        if (!wish) {
            return null;
        }
        try {
            const details = await this.getWishDetails(wish.id, wish.crwtitle);
            return {
                ...wish,
                description: details.description || wish.description,
                author: details.author || wish.author,
                focusArea: details.focusArea || wish.focusArea,
                supporters: details.supporters && details.supporters.length > 0 ? details.supporters : wish.supporters,
            };
        }
        catch (e) {
            console.warn('Error fetching detailed wish page, returning base wish:', e);
            return wish;
        }
    }
    async getWishDetails(id, crwtitle) {
        const params = new URLSearchParams({
            action: 'parse',
            page: crwtitle,
            prop: 'text',
        });
        const data = await this.request(params);
        const text = data.parse?.text?.['*'] || data.query?.parse?.text?.['*'] || '';
        // Extract proposer / author
        const authorMatch = text.match(/class="ext-communityrequests-wish--proposer"[^>]*>Author:\s*<a[^>]*>([^<]+)<\/a>/i)
            || text.match(/class="ext-communityrequests-wish--proposer"[^>]*>.*?<a[^>]*>([^<]+)<\/a>/is)
            || text.match(/title="User:([^"/]+)"/i);
        const author = authorMatch ? authorMatch[1].trim() : undefined;
        // Extract description
        const descMatch = text.match(/class="ext-communityrequests-wish--description"[^>]*>([\s\S]*?)<\/div>/i);
        let description = '';
        if (descMatch) {
            description = descMatch[1]
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }
        // Extract focus area
        const focusAreaMatch = text.match(/class="ext-communityrequests-wish--focus-area"[^>]*>([\s\S]*?)<\/div>/i);
        let focusArea;
        if (focusAreaMatch) {
            focusArea = focusAreaMatch[1]
                .replace(/<[^>]+>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
        }
        // Extract supporters with their optional comments (as shown in Meta-Wiki)
        const supporters = [];
        const supporterMatches = Array.from(text.matchAll(/class="ext-communityrequests-vote-entry--support"[^>]*>([\s\S]*?)<\/div>/gi));
        for (const m of supporterMatches) {
            const rawHtml = m[1];
            const userMatch = rawHtml.match(/title="User:([^"/]+)"/i) || rawHtml.match(/<a[^>]*>([^<]+)<\/a>/i);
            const username = userMatch ? userMatch[1].replace(' (page does not exist)', '').trim() : '';
            // Extract optional comment: text after "Support" and before username
            const cleanText = rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            let comment = '';
            const supportIdx = cleanText.indexOf('Support');
            if (supportIdx !== -1 && username) {
                const afterSupport = cleanText.slice(supportIdx + 7).trim();
                const userIdx = afterSupport.lastIndexOf(username);
                if (userIdx > 0) {
                    comment = afterSupport.slice(0, userIdx).trim();
                }
            }
            // Extract timestamp (e.g. "05:08, 9 November 2026")
            const timeMatch = cleanText.match(/\d{2}:\d{2},\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/);
            const timestamp = timeMatch ? timeMatch[0] : '';
            if (username) {
                supporters.push({
                    username,
                    comment: comment || undefined,
                    timestamp: timestamp || undefined,
                });
            }
        }
        return {
            description,
            author,
            focusArea,
            supporters,
        };
    }
    /**
     * Submits a genuine support vote with optional comment to Meta-Wiki.
     * Modifies Community Wishlist/W<id>/Votes via MediaWiki Action API.
     */
    async submitSupportVote(crwtitle, comment, accessToken, username, voteAction = 'add') {
        if (!accessToken) {
            return { success: false, message: 'OAuth access token required to publish edits to Meta-Wiki' };
        }
        const consumerKey = process.env.OAUTH_CONSUMER_KEY || '';
        const consumerSecret = process.env.OAUTH_CONSUMER_SECRET || '';
        const tokenKey = typeof accessToken === 'string' ? accessToken : accessToken.key;
        const tokenSecret = typeof accessToken === 'string' ? '' : accessToken.secret;
        try {
            // 1. Get userinfo and CSRF token via OAuth
            const tokenUrl = `${MEDIAWIKI_API_URL}?action=query&meta=userinfo%7Ctokens&format=json`;
            const nonce1 = crypto_1.default.randomBytes(16).toString('hex');
            const ts1 = Math.floor(Date.now() / 1000).toString();
            const oauthParams1 = {
                oauth_consumer_key: consumerKey,
                oauth_nonce: nonce1,
                oauth_signature_method: 'HMAC-SHA1',
                oauth_timestamp: ts1,
                oauth_token: tokenKey,
                oauth_version: '1.0',
            };
            const authHeader1 = (0, oauth_1.buildOAuthHeader)('GET', tokenUrl, oauthParams1, consumerSecret, tokenSecret);
            const tokenRes = await (0, node_fetch_1.default)(tokenUrl, {
                headers: {
                    'Authorization': authHeader1,
                    'User-Agent': USER_AGENT,
                },
            });
            const tokenData = await tokenRes.json();
            const userId = tokenData?.query?.userinfo?.id;
            const csrfToken = tokenData?.query?.tokens?.csrftoken;
            if (!csrfToken || !userId) {
                throw new Error('Unable to retrieve CSRF token or user ID from Wikimedia');
            }
            // 2. Submit vote natively using MediaWiki CommunityRequests API (action=wishlistvote)
            // CommunityRequests expects the wikitext entity slug (e.g. 'W826' or 'FA12')
            // as verified in WishlistConfig::getEntityPageRefFromWikitextVal
            const entityMatch = crwtitle.match(/(W\d+|FA\d+)$/i);
            const primaryEntity = entityMatch ? entityMatch[1].toUpperCase() : (crwtitle.split('/').pop() || crwtitle).trim();
            const fallbackEntity = crwtitle.trim().replace(/ /g, '_');
            const attemptVote = async (targetEntity) => {
                const voteBody = {
                    action: 'wishlistvote',
                    entity: targetEntity,
                    voteaction: voteAction,
                    token: csrfToken,
                    format: 'json',
                };
                const cleanComment = (comment || '').trim();
                if (cleanComment && voteAction === 'add') {
                    voteBody.comment = cleanComment;
                }
                const nonce2 = crypto_1.default.randomBytes(16).toString('hex');
                const ts2 = Math.floor(Date.now() / 1000).toString();
                const oauthParams2 = {
                    oauth_consumer_key: consumerKey,
                    oauth_nonce: nonce2,
                    oauth_signature_method: 'HMAC-SHA1',
                    oauth_timestamp: ts2,
                    oauth_token: tokenKey,
                    oauth_version: '1.0',
                };
                const authHeader2 = (0, oauth_1.buildOAuthHeader)('POST', MEDIAWIKI_API_URL, oauthParams2, consumerSecret, tokenSecret, voteBody);
                const bodySerialized = Object.keys(voteBody)
                    .map(k => `${(0, oauth_1.percentEncode)(k)}=${(0, oauth_1.percentEncode)(voteBody[k])}`)
                    .join('&');
                const voteRes = await (0, node_fetch_1.default)(MEDIAWIKI_API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': authHeader2,
                        'User-Agent': USER_AGENT,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: bodySerialized,
                });
                return await voteRes.json();
            };
            let voteData = await attemptVote(primaryEntity);
            if (voteData?.error?.code === 'invalidentity' && primaryEntity !== fallbackEntity) {
                console.warn(`Retrying wishlistvote with fallback entity: ${fallbackEntity}`);
                voteData = await attemptVote(fallbackEntity);
            }
            if (voteData?.error) {
                throw new Error(voteData.error.info || 'Vote submission to Meta-Wiki failed');
            }
            return { success: true };
        }
        catch (err) {
            console.warn('Meta-Wiki edit request warning:', err.message);
            return { success: false, message: err.message };
        }
    }
    userActivityCache = new Map();
    USER_ACTIVITY_TTL = 60 * 1000; // 60 seconds
    async fetchUserWishActivity(username) {
        const normUser = username.trim().toLowerCase();
        const now = Date.now();
        const cached = this.userActivityCache.get(normUser);
        if (cached && (now - cached.timestamp) < this.USER_ACTIVITY_TTL) {
            return { createdTitles: cached.createdTitles, supportedTitles: cached.supportedTitles };
        }
        const createdTitles = new Set();
        const supportedTitles = new Set();
        let ucContinue = undefined;
        // Scan user contributions in namespace 0 (Main/Wishlist) up to 4 batches (2000 edits max)
        for (let page = 0; page < 4; page++) {
            const params = new URLSearchParams({
                action: 'query',
                list: 'usercontribs',
                ucuser: username,
                ucnamespace: '0',
                uclimit: '500',
                ucprop: 'title|timestamp|comment|flags|ids',
            });
            if (ucContinue) {
                params.set('uccontinue', ucContinue);
            }
            const data = await this.request(params);
            const contribs = data.query?.usercontribs || [];
            for (const c of contribs) {
                const title = c.title || '';
                if (!title.startsWith('Community Wishlist/'))
                    continue;
                // Support vote subpage: Community Wishlist/W<id>/Votes
                const voteMatch = title.match(/^Community Wishlist\/(W\d+)\/Votes$/i);
                if (voteMatch) {
                    supportedTitles.add(voteMatch[1].toUpperCase());
                    continue;
                }
                // Wish page creation: Community Wishlist/W<id>
                const wishMatch = title.match(/^Community Wishlist\/(W\d+)$/i);
                if (wishMatch) {
                    const comment = (c.comment || '').toLowerCase();
                    const isCreation = c.parentid === 0 ||
                        c.new !== undefined ||
                        comment.includes('publish') ||
                        comment.includes('created page');
                    if (isCreation) {
                        createdTitles.add(wishMatch[1].toUpperCase());
                    }
                }
            }
            ucContinue = data.continue?.uccontinue;
            if (!ucContinue || contribs.length === 0) {
                break;
            }
        }
        const result = { createdTitles, supportedTitles, timestamp: now };
        this.userActivityCache.set(normUser, result);
        return { createdTitles, supportedTitles };
    }
    async searchWishes(query, limit = 50) {
        const allWishes = await this.fetchAllWishesFromMeta();
        const q = query.toLowerCase().trim();
        if (!q)
            return allWishes.slice(0, limit);
        return allWishes.filter(w => (w.title && w.title.toLowerCase().includes(q)) ||
            (w.description && w.description.toLowerCase().includes(q)) ||
            (w.tags && w.tags.some(t => t.toLowerCase().includes(q))) ||
            (w.author && w.author.toLowerCase().includes(q)) ||
            (w.crwtitle && w.crwtitle.toLowerCase().includes(q))).slice(0, limit);
    }
    async getWishesCreatedBy(username, limit = 100) {
        const allWishes = await this.fetchAllWishesFromMeta();
        const normUser = username.trim().toLowerCase();
        try {
            const { createdTitles } = await this.fetchUserWishActivity(username);
            const userWishes = allWishes.filter(w => {
                const wishIdMatch = (w.crwtitle || '').match(/(W\d+)$/i);
                const wishKey = wishIdMatch ? wishIdMatch[1].toUpperCase() : '';
                const isCreated = wishKey ? createdTitles.has(wishKey) : false;
                const isAuthor = w.author && w.author.toLowerCase() === normUser;
                return isCreated || isAuthor;
            }).map(w => {
                if (!w.author) {
                    return { ...w, author: username };
                }
                return w;
            });
            return userWishes.slice(0, limit);
        }
        catch (e) {
            console.warn('Error fetching user activity for created wishes:', e);
            return allWishes.filter(w => w.author?.toLowerCase() === normUser).slice(0, limit);
        }
    }
    async getWishesSupportedBy(username, limit = 100) {
        const allWishes = await this.fetchAllWishesFromMeta();
        const normUser = username.trim().toLowerCase();
        try {
            const { supportedTitles } = await this.fetchUserWishActivity(username);
            const userSupported = allWishes.filter(w => {
                const wishIdMatch = (w.crwtitle || '').match(/(W\d+)$/i);
                const wishKey = wishIdMatch ? wishIdMatch[1].toUpperCase() : '';
                const isVoted = wishKey ? supportedTitles.has(wishKey) : false;
                const isSupporter = w.supporters?.some(s => s.username?.toLowerCase() === normUser);
                return isVoted || isSupporter;
            });
            return userSupported.slice(0, limit);
        }
        catch (e) {
            console.warn('Error fetching user activity for supported wishes:', e);
            return allWishes.filter(w => w.supporters?.some(s => s.username?.toLowerCase() === normUser)).slice(0, limit);
        }
    }
}
exports.wikimediaClient = new WikimediaClient();
//# sourceMappingURL=wikimedia.js.map