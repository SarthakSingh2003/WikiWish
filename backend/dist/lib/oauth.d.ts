export interface OAuthTokens {
    key: string;
    secret: string;
}
export interface AuthenticatedUser {
    username: string;
    displayName: string;
    editcount?: number;
}
export declare function percentEncode(str: string): string;
export declare function buildOAuthHeader(method: string, urlStr: string, oauthParams: Record<string, string>, consumerSecret: string, tokenSecret?: string, bodyParams?: Record<string, string>): string;
export declare function initiateOAuth(): Promise<{
    oauth_token: string;
    oauth_token_secret: string;
    authorizeUrl: string;
}>;
export declare function exchangeAccessToken(requestToken: string, verifier: string, requestTokenSecret: string): Promise<OAuthTokens>;
export declare function getAuthenticatedUser(accessToken: OAuthTokens): Promise<AuthenticatedUser>;
//# sourceMappingURL=oauth.d.ts.map