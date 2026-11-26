import { OAuthTokens } from './oauth';
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
declare class WikimediaClient {
    private lastRequestTime;
    private readonly MIN_REQUEST_INTERVAL;
    private readonly MAX_CONCURRENT;
    private currentConcurrent;
    private rateLimit;
    private releaseConcurrency;
    request(params: URLSearchParams, headers?: Record<string, string>): Promise<APIResponse>;
    private allWishesCache;
    private allWishesCacheTime;
    private readonly ALL_WISHES_TTL;
    fetchAllWishesFromMeta(): Promise<WikiWish[]>;
    getAllWishes(limit?: number, continueToken?: string): Promise<{
        wishes: WikiWish[];
        continue?: string;
    }>;
    getWishById(wishId: number): Promise<WikiWish | null>;
    private getWishDetails;
    /**
     * Submits a genuine support vote with optional comment to Meta-Wiki.
     * Modifies Community Wishlist/W<id>/Votes via MediaWiki Action API.
     */
    submitSupportVote(crwtitle: string, comment: string, accessToken?: OAuthTokens | string, username?: string, voteAction?: 'add' | 'remove'): Promise<{
        success: boolean;
        message?: string;
    }>;
    private userActivityCache;
    private readonly USER_ACTIVITY_TTL;
    private fetchUserWishActivity;
    searchWishes(query: string, limit?: number): Promise<WikiWish[]>;
    getWishesCreatedBy(username: string, limit?: number): Promise<WikiWish[]>;
    getWishesSupportedBy(username: string, limit?: number): Promise<WikiWish[]>;
}
export declare const wikimediaClient: WikimediaClient;
export {};
//# sourceMappingURL=wikimedia.d.ts.map