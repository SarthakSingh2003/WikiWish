"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportedWishesByUser = void 0;
const express_1 = require("express");
const wikimedia_1 = require("../lib/wikimedia");
const router = (0, express_1.Router)();
// In-memory storage for user-supported wishes in WikiWish
exports.supportedWishesByUser = new Map();
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 1000;
        const continueToken = req.query.continue;
        const query = req.query.search;
        let result;
        if (query) {
            result = await wikimedia_1.wikimediaClient.searchWishes(query, limit);
            res.json({ wishes: result });
        }
        else {
            result = await wikimedia_1.wikimediaClient.getAllWishes(limit, continueToken);
            res.json(result);
        }
    }
    catch (error) {
        console.error('Error fetching wishes:', error);
        res.status(500).json({ error: 'Failed to fetch wishes' });
    }
});
router.get('/user-supports', async (req, res) => {
    const sessionUser = req.session?.user;
    const username = sessionUser?.username || req.query.username;
    if (!username) {
        return res.json({ supportedWishIds: [] });
    }
    const supportedSet = exports.supportedWishesByUser.get(username) || new Set();
    try {
        const wishes = await wikimedia_1.wikimediaClient.fetchAllWishesFromMeta();
        for (const w of wishes) {
            if (w.supporters?.some(s => s.username?.toLowerCase() === username.toLowerCase())) {
                supportedSet.add(w.id);
            }
        }
        exports.supportedWishesByUser.set(username, supportedSet);
    }
    catch (err) {
        // Ignore cache error
    }
    return res.json({
        supportedWishIds: Array.from(supportedSet),
    });
});
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const wish = await wikimedia_1.wikimediaClient.getWishById(id);
        if (!wish) {
            return res.status(404).json({ error: 'Wish not found' });
        }
        res.json({ wish });
    }
    catch (error) {
        console.error('Error fetching wish:', error);
        res.status(500).json({ error: 'Failed to fetch wish' });
    }
});
router.post('/:id/support', async (req, res) => {
    try {
        const wishId = parseInt(req.params.id);
        const sessionUser = req.session?.user;
        const comment = (req.body?.comment || '').trim();
        const action = req.body?.action === 'remove' ? 'remove' : 'add';
        if (!sessionUser?.username || !sessionUser?.accessToken) {
            return res.status(401).json({
                error: 'OAuth authentication required',
                message: 'You must authenticate with your verified Wikimedia account via OAuth to officially record support votes on Meta-Wiki.',
            });
        }
        const wish = await wikimedia_1.wikimediaClient.getWishById(wishId);
        if (!wish) {
            return res.status(404).json({ error: 'Wish not found' });
        }
        // Publish official edit to Meta-Wiki with user's verified OAuth tokens
        const metaWikiStatus = await wikimedia_1.wikimediaClient.submitSupportVote(wish.crwtitle, comment, sessionUser.accessToken, sessionUser.username, action);
        if (!metaWikiStatus.success) {
            return res.status(502).json({
                error: 'Meta-Wiki submission failed',
                message: metaWikiStatus.message || 'Failed to publish support vote to Wikimedia Meta-Wiki.',
            });
        }
        if (action === 'remove') {
            if (exports.supportedWishesByUser.has(sessionUser.username)) {
                exports.supportedWishesByUser.get(sessionUser.username).delete(wishId);
            }
            if (wish.supporters) {
                const prevCount = wish.supporters.length;
                wish.supporters = wish.supporters.filter(s => s.username.toLowerCase() !== sessionUser.username.toLowerCase());
                if (wish.supporters.length < prevCount && wish.votecount && wish.votecount > 0) {
                    wish.votecount -= 1;
                }
            }
            return res.json({
                success: true,
                action: 'remove',
                wishId,
                votecount: wish.votecount,
                supporters: wish.supporters,
            });
        }
        // Update in-memory user support state
        if (!exports.supportedWishesByUser.has(sessionUser.username)) {
            exports.supportedWishesByUser.set(sessionUser.username, new Set());
        }
        exports.supportedWishesByUser.get(sessionUser.username).add(wishId);
        const now = new Date();
        const formattedTimestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}, ${now.getDate()} ${now.toLocaleString('en-US', { month: 'long' })} ${now.getFullYear()}`;
        // Update wish supporters list in memory so immediate UI updates show the comment
        if (!wish.supporters)
            wish.supporters = [];
        const existingIndex = wish.supporters.findIndex(s => s.username.toLowerCase() === sessionUser.username.toLowerCase());
        const isUpdate = existingIndex >= 0;
        if (isUpdate) {
            wish.supporters[existingIndex].comment = comment || undefined;
            wish.supporters[existingIndex].timestamp = formattedTimestamp;
        }
        else {
            wish.supporters.unshift({
                username: sessionUser.username,
                comment: comment || undefined,
                timestamp: formattedTimestamp,
            });
            wish.votecount = (wish.votecount || 0) + 1;
        }
        res.json({
            success: true,
            action: 'add',
            isUpdate,
            wishId,
            publishedToMetaWiki: true,
            username: sessionUser.username,
            comment,
            votecount: wish.votecount,
            supporters: wish.supporters,
        });
    }
    catch (error) {
        console.error('Error recording support vote:', error);
        res.status(500).json({ error: 'Failed to record support vote' });
    }
});
router.delete('/:id/support', async (req, res) => {
    try {
        const wishId = parseInt(req.params.id);
        const sessionUser = req.session?.user;
        if (!sessionUser?.username || !sessionUser?.accessToken) {
            return res.status(401).json({
                error: 'OAuth authentication required',
                message: 'You must authenticate with your verified Wikimedia account via OAuth to manage support votes on Meta-Wiki.',
            });
        }
        const wish = await wikimedia_1.wikimediaClient.getWishById(wishId);
        if (!wish) {
            return res.status(404).json({ error: 'Wish not found' });
        }
        const metaWikiStatus = await wikimedia_1.wikimediaClient.submitSupportVote(wish.crwtitle, '', sessionUser.accessToken, sessionUser.username, 'remove');
        if (!metaWikiStatus.success) {
            return res.status(502).json({
                error: 'Meta-Wiki submission failed',
                message: metaWikiStatus.message || 'Failed to remove support vote on Wikimedia Meta-Wiki.',
            });
        }
        if (exports.supportedWishesByUser.has(sessionUser.username)) {
            exports.supportedWishesByUser.get(sessionUser.username).delete(wishId);
        }
        if (wish.supporters) {
            const prevCount = wish.supporters.length;
            wish.supporters = wish.supporters.filter(s => s.username.toLowerCase() !== sessionUser.username.toLowerCase());
            if (wish.supporters.length < prevCount && wish.votecount && wish.votecount > 0) {
                wish.votecount -= 1;
            }
        }
        res.json({
            success: true,
            action: 'remove',
            wishId,
            votecount: wish.votecount,
            supporters: wish.supporters,
        });
    }
    catch (error) {
        console.error('Error removing support vote:', error);
        res.status(500).json({ error: 'Failed to remove support vote' });
    }
});
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const limit = parseInt(req.query.limit) || 20;
        if (!query) {
            return res.status(400).json({ error: 'Search query required' });
        }
        const wishes = await wikimedia_1.wikimediaClient.searchWishes(query, limit);
        res.json({ wishes });
    }
    catch (error) {
        console.error('Error searching wishes:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});
exports.default = router;
//# sourceMappingURL=wishes.js.map