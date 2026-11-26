"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wikimedia_1 = require("../lib/wikimedia");
const wishes_1 = require("./wishes");
const router = (0, express_1.Router)();
router.get('/:username', async (req, res) => {
    try {
        const username = req.params.username;
        if (!username) {
            return res.status(400).json({ error: 'Username required' });
        }
        const [createdWishes, supportedWishes] = await Promise.allSettled([
            wikimedia_1.wikimediaClient.getWishesCreatedBy(username),
            wikimedia_1.wikimediaClient.getWishesSupportedBy(username),
        ]);
        const created = createdWishes.status === 'fulfilled' ? createdWishes.value : [];
        let supported = supportedWishes.status === 'fulfilled' ? supportedWishes.value : [];
        // Also include wishes supported locally in WikiWish by this user
        if (wishes_1.supportedWishesByUser.has(username)) {
            const localIds = wishes_1.supportedWishesByUser.get(username);
            const wishes = await wikimedia_1.wikimediaClient.fetchAllWishesFromMeta();
            for (const w of wishes) {
                if (localIds.has(w.id) && !supported.some(s => s.id === w.id)) {
                    supported.push(w);
                }
            }
        }
        res.json({
            username,
            created,
            supported,
            statistics: {
                created: created.length,
                supported: supported.length,
            },
        });
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});
router.get('/:username/created', async (req, res) => {
    try {
        const username = req.params.username;
        const wishes = await wikimedia_1.wikimediaClient.getWishesCreatedBy(username);
        res.json({ wishes });
    }
    catch (error) {
        console.error('Error fetching created wishes:', error);
        res.status(500).json({ error: 'Failed to fetch created wishes' });
    }
});
router.get('/:username/supported', async (req, res) => {
    try {
        const username = req.params.username;
        let wishes = await wikimedia_1.wikimediaClient.getWishesSupportedBy(username);
        // Merge in any locally supported wishes in WikiWish
        if (wishes_1.supportedWishesByUser.has(username)) {
            const localIds = wishes_1.supportedWishesByUser.get(username);
            const allWishes = await wikimedia_1.wikimediaClient.fetchAllWishesFromMeta();
            for (const w of allWishes) {
                if (localIds.has(w.id) && !wishes.some(s => s.id === w.id)) {
                    wishes.push(w);
                }
            }
        }
        res.json({ wishes });
    }
    catch (error) {
        console.error('Error fetching supported wishes:', error);
        res.status(500).json({ error: 'Failed to fetch supported wishes' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map