"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oauth_1 = require("../lib/oauth");
const router = (0, express_1.Router)();
router.get('/config', (_req, res) => {
    const key = process.env.OAUTH_CONSUMER_KEY;
    const secret = process.env.OAUTH_CONSUMER_SECRET;
    const isConfigured = Boolean(key &&
        secret &&
        key !== 'your_oauth_consumer_key' &&
        secret !== 'your_oauth_consumer_secret');
    res.json({ oauthConfigured: isConfigured });
});
router.get('/login', async (req, res) => {
    const key = process.env.OAUTH_CONSUMER_KEY;
    const secret = process.env.OAUTH_CONSUMER_SECRET;
    if (!key || !secret || key === 'your_oauth_consumer_key' || secret === 'your_oauth_consumer_secret') {
        return res.status(503).json({
            error: 'OAuth not configured',
            message: 'Please set OAUTH_CONSUMER_KEY and OAUTH_CONSUMER_SECRET in backend/.env to connect your Wikimedia account.',
        });
    }
    try {
        const { oauth_token, oauth_token_secret, authorizeUrl } = await (0, oauth_1.initiateOAuth)();
        req.session.requestToken = oauth_token;
        req.session.requestTokenSecret = oauth_token_secret;
        res.redirect(authorizeUrl);
    }
    catch (error) {
        console.error('OAuth initiation error:', error);
        res.status(502).json({
            error: 'Failed to initiate OAuth with Wikimedia',
            message: error.message,
        });
    }
});
router.get('/callback', async (req, res) => {
    const { oauth_token, oauth_verifier } = req.query;
    const requestTokenSecret = req.session?.requestTokenSecret;
    if (!oauth_token || !oauth_verifier || !requestTokenSecret) {
        return res.status(400).json({
            error: 'Missing OAuth parameters or expired session',
            message: 'OAuth authorization could not be completed. Please try signing in again.',
        });
    }
    try {
        const accessToken = await (0, oauth_1.exchangeAccessToken)(oauth_token, oauth_verifier, requestTokenSecret);
        const userInfo = await (0, oauth_1.getAuthenticatedUser)(accessToken);
        req.session.user = {
            username: userInfo.username,
            displayName: userInfo.displayName,
            accessToken,
        };
        // Clean up temporary request token
        delete req.session.requestToken;
        delete req.session.requestTokenSecret;
        const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
        res.redirect(`${frontendUrl}/dashboard`);
    }
    catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({
            error: 'OAuth exchange failed',
            message: error.message,
        });
    }
});
router.get('/me', (req, res) => {
    if (req.session?.user) {
        res.json({
            user: {
                username: req.session.user.username,
                displayName: req.session.user.displayName,
            },
        });
    }
    else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});
router.all('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
        if (req.method === 'POST') {
            res.json({ message: 'Logged out successfully' });
        }
        else {
            res.redirect(frontendUrl || '/');
        }
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map