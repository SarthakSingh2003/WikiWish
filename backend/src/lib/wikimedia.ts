import fetch from 'node-fetch';
import crypto from 'crypto';
import { buildOAuthHeader, OAuthTokens, percentEncode } from './oauth';

const MEDIAWIKI_API_URL = 'https://meta.wikimedia.org/w/api.php';
const USER_AGENT = 'WikiWish/1.0 (https://github.com/wikiwish; contact@wikimedia.org)';

export interface WikiWish {
  id: number;
  status: string;
  type: string;
  title: string;
  tags: string[];
  votecount: number;
  created: string;
  updated: string;
  crwns: number;
  crwtitle: string;
  description?: string;
  author?: string;
  focusArea?: string;
  supporters?: Supporter[];
}

export interface Supporter {
  username: string;
  timestamp?: string;
  comment?: string;
  link?: string;
}

export interface User {
  username: string;
  displayName: string;
  avatarUrl?: string;
  talkPage?: string;
}

interface APIResponse {
  batchcomplete?: string | boolean;
  continue?: Record<string, unknown>;
  query?: {
    'communityrequests-wishes'?: any[];
    communityrequests_wishes?: any[];
    search?: SearchResult[];
    usercontribs?: any[];
    pages?: Record<string, PageInfo>;
    parse?: ParseResult;
  };
  parse?: ParseResult;
  error?: APIError;
}

interface APIError {
  code: string;
  info: string;
  [key: string]: unknown;
}

interface SearchResult {
  ns: number;
  title: string;
  pageid: number;
  size: number;
  wordcount: number;
  snippet: string;
  timestamp: string;
}

interface PageInfo {
  pageid: number;
  ns: number;
  title: string;
  contentmodel?: string;
  pagelanguage?: string;
  touched?: string;
  lastrevid?: number;
  length?: number;
}

interface ParseResult {
  title: string;
  text?: {
    '*': string;
  };
  categories?: string[];
  links?: string[];
  templates?: string[];
}

class WikimediaClient {
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 100;
  private readonly MAX_CONCURRENT = 3;
  private currentConcurrent = 0;

  private async rateLimit() {
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

  private releaseConcurrency() {
    this.currentConcurrent--;
  }

  async request(params: URLSearchParams, headers: Record<string, string> = {}): Promise<APIResponse> {
    await this.rateLimit();

    const url = new URL(MEDIAWIKI_API_URL);
    params.set('format', 'json');
    url.search = params.toString();

    let response: any;
    try {
      response = await fetch(url.toString(), {
        headers: {
          'User-Agent': USER_AGENT,
          ...headers,
        },
        timeout: 10000,
      });
    } catch (error) {
      this.releaseConcurrency();
      throw error;
    }

    this.releaseConcurrency();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as APIResponse;

    if (data.error) {
      throw new Error(`API Error: ${data.error.info || JSON.stringify(data.error)}`);
    }

    return data;
  }

  async getAllWishes(limit: number = 100, continueToken?: string): Promise<{ wishes: WikiWish[]; continue?: string }> {
    const params = new URLSearchParams({
      action: 'query',
      list: 'communityrequests-wishes',
      crwlimit: Math.min(limit, 500).toString(),
      crwprop: 'tags|status|type|title|votecount|created|updated|description|proposer|focusarea',
    });

    if (continueToken) {
      params.set('crwcontinue', continueToken);
    }

    const data = await this.request(params);
    const rawWishes = data.query?.['communityrequests-wishes'] || data.query?.communityrequests_wishes || [];
    const newContinue = data.continue?.crwcontinue as string | undefined;

    const wishes: WikiWish[] = rawWishes.map((w: any) => {
      const normalizedStatus = w.status === 'done' ? 'completed' : (w.status || 'under-review');
      return {
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
      };
    });

    return {
      wishes,
      ...(newContinue && { continue: newContinue }),
    };
  }

  async getWishById(wishId: number): Promise<WikiWish | null> {
    const { wishes } = await this.getAllWishes(100);
    const wish = wishes.find(w => w.id === wishId);
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
    } catch (e) {
      console.warn('Error fetching detailed wish page, returning base wish:', e);
      return wish;
    }
  }

  private async getWishDetails(id: number, crwtitle: string): Promise<Partial<WikiWish>> {
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
    let focusArea: string | undefined;
    if (focusAreaMatch) {
      focusArea = focusAreaMatch[1]
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Extract supporters with their optional comments (as shown in Meta-Wiki)
    const supporters: Supporter[] = [];
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
  async submitSupportVote(
    crwtitle: string,
    comment: string,
    accessToken?: OAuthTokens | string,
    username?: string,
    voteAction: 'add' | 'remove' = 'add'
  ): Promise<{ success: boolean; message?: string }> {
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
      const nonce1 = crypto.randomBytes(16).toString('hex');
      const ts1 = Math.floor(Date.now() / 1000).toString();

      const oauthParams1 = {
        oauth_consumer_key: consumerKey,
        oauth_nonce: nonce1,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: ts1,
        oauth_token: tokenKey,
        oauth_version: '1.0',
      };

      const authHeader1 = buildOAuthHeader('GET', tokenUrl, oauthParams1, consumerSecret, tokenSecret);

      const tokenRes = await fetch(tokenUrl, {
        headers: {
          'Authorization': authHeader1,
          'User-Agent': USER_AGENT,
        },
      });

      const tokenData = await tokenRes.json() as any;
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

      const attemptVote = async (targetEntity: string) => {
        const voteBody: Record<string, string> = {
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

        const nonce2 = crypto.randomBytes(16).toString('hex');
        const ts2 = Math.floor(Date.now() / 1000).toString();

        const oauthParams2 = {
          oauth_consumer_key: consumerKey,
          oauth_nonce: nonce2,
          oauth_signature_method: 'HMAC-SHA1',
          oauth_timestamp: ts2,
          oauth_token: tokenKey,
          oauth_version: '1.0',
        };

        const authHeader2 = buildOAuthHeader(
          'POST',
          MEDIAWIKI_API_URL,
          oauthParams2,
          consumerSecret,
          tokenSecret,
          voteBody
        );

        const bodySerialized = Object.keys(voteBody)
          .map(k => `${percentEncode(k)}=${percentEncode(voteBody[k])}`)
          .join('&');

        const voteRes = await fetch(MEDIAWIKI_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': authHeader2,
            'User-Agent': USER_AGENT,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: bodySerialized,
        });

        return await voteRes.json() as any;
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
    } catch (err: any) {
      console.warn('Meta-Wiki edit request warning:', err.message);
      return { success: false, message: err.message };
    }
  }

  async searchWishes(query: string, limit: number = 20): Promise<WikiWish[]> {
    const { wishes } = await this.getAllWishes(100);
    const q = query.toLowerCase().trim();
    if (!q) return wishes.slice(0, limit);

    return wishes.filter(w =>
      (w.title && w.title.toLowerCase().includes(q)) ||
      (w.description && w.description.toLowerCase().includes(q)) ||
      (w.tags && w.tags.some(t => t.toLowerCase().includes(q))) ||
      (w.author && w.author.toLowerCase().includes(q)) ||
      (w.crwtitle && w.crwtitle.toLowerCase().includes(q))
    ).slice(0, limit);
  }

  async getWishesCreatedBy(username: string, limit: number = 50): Promise<WikiWish[]> {
    const { wishes } = await this.getAllWishes(100);
    try {
      const params = new URLSearchParams({
        action: 'query',
        list: 'usercontribs',
        ucuser: username,
        ucnamespace: '0',
        uclimit: '100',
      });
      const data = await this.request(params);
      const contribs = data.query?.usercontribs || [];
      const createdTitles = new Set<string>();

      for (const c of contribs) {
        const wishMatch = c.title.match(/^Community Wishlist\/(W\d+)$/i);
        if (wishMatch && (c.new !== undefined || (c.comment && c.comment.toLowerCase().includes('publishing')))) {
          createdTitles.add(c.title);
        }
      }

      const userWishes = wishes.filter(w =>
        createdTitles.has(w.crwtitle) || (w.author && w.author.toLowerCase() === username.toLowerCase())
      );
      return userWishes.slice(0, limit);
    } catch (e) {
      console.warn('Error fetching user contribs for created wishes:', e);
      return wishes.filter(w => w.author?.toLowerCase() === username.toLowerCase()).slice(0, limit);
    }
  }

  async getWishesSupportedBy(username: string, limit: number = 50): Promise<WikiWish[]> {
    const { wishes } = await this.getAllWishes(100);
    try {
      const params = new URLSearchParams({
        action: 'query',
        list: 'usercontribs',
        ucuser: username,
        ucnamespace: '0',
        uclimit: '100',
      });
      const data = await this.request(params);
      const contribs = data.query?.usercontribs || [];
      const supportedWishTitles = new Set<string>();

      for (const c of contribs) {
        const voteMatch = c.title.match(/^Community Wishlist\/(W\d+)\/Votes$/i);
        if (voteMatch) {
          supportedWishTitles.add(`Community Wishlist/${voteMatch[1]}`);
        }
      }

      const userSupported = wishes.filter(w =>
        supportedWishTitles.has(w.crwtitle) ||
        w.supporters?.some(s => s.username.toLowerCase() === username.toLowerCase())
      );
      return userSupported.slice(0, limit);
    } catch (e) {
      console.warn('Error fetching user contribs for supported wishes:', e);
      return wishes.filter(w =>
        w.supporters?.some(s => s.username.toLowerCase() === username.toLowerCase())
      ).slice(0, limit);
    }
  }
}

export const wikimediaClient = new WikimediaClient();
