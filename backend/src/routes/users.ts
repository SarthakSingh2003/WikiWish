import { Router, Request, Response } from 'express';
import { wikimediaClient } from '../lib/wikimedia';
import { supportedWishesByUser } from './wishes';

const router = Router();

router.get('/:username', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;

    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    const [createdWishes, supportedWishes] = await Promise.allSettled([
      wikimediaClient.getWishesCreatedBy(username),
      wikimediaClient.getWishesSupportedBy(username),
    ]);

    const created = createdWishes.status === 'fulfilled' ? createdWishes.value : [];
    let supported = supportedWishes.status === 'fulfilled' ? supportedWishes.value : [];

    // Also include wishes supported locally in WikiWish by this user
    if (supportedWishesByUser.has(username)) {
      const localIds = supportedWishesByUser.get(username)!;
      const wishes = await wikimediaClient.fetchAllWishesFromMeta();
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
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/:username/created', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    const wishes = await wikimediaClient.getWishesCreatedBy(username);
    res.json({ wishes });
  } catch (error) {
    console.error('Error fetching created wishes:', error);
    res.status(500).json({ error: 'Failed to fetch created wishes' });
  }
});

router.get('/:username/supported', async (req: Request, res: Response) => {
  try {
    const username = req.params.username;
    let wishes = await wikimediaClient.getWishesSupportedBy(username);

    // Merge in any locally supported wishes in WikiWish
    if (supportedWishesByUser.has(username)) {
      const localIds = supportedWishesByUser.get(username)!;
      const allWishes = await wikimediaClient.fetchAllWishesFromMeta();
      for (const w of allWishes) {
        if (localIds.has(w.id) && !wishes.some(s => s.id === w.id)) {
          wishes.push(w);
        }
      }
    }

    res.json({ wishes });
  } catch (error) {
    console.error('Error fetching supported wishes:', error);
    res.status(500).json({ error: 'Failed to fetch supported wishes' });
  }
});

export default router;
