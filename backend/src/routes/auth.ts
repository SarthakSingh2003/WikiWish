import { Router, Request, Response } from 'express';
import { initiateOAuth, exchangeAccessToken, getAuthenticatedUser } from '../lib/oauth';

const router = Router();

router.get('/config', (_req: Request, res: Response) => {
  const key = process.env.OAUTH_CONSUMER_KEY;
  const secret = process.env.OAUTH_CONSUMER_SECRET;
  const isConfigured = Boolean(
    key &&
    secret &&
    key !== 'your_oauth_consumer_key' &&
    secret !== 'your_oauth_consumer_secret'
  );
  res.json({ oauthConfigured: isConfigured });
});

router.get('/login', async (req: Request, res: Response) => {
  const key = process.env.OAUTH_CONSUMER_KEY;
  const secret = process.env.OAUTH_CONSUMER_SECRET;

  if (!key || !secret || key === 'your_oauth_consumer_key' || secret === 'your_oauth_consumer_secret') {
    return res.status(503).json({
      error: 'OAuth not configured',
      message: 'Please set OAUTH_CONSUMER_KEY and OAUTH_CONSUMER_SECRET in backend/.env to connect your Wikimedia account.',
    });
  }

  try {
    const { oauth_token, oauth_token_secret, authorizeUrl } = await initiateOAuth();

    (req.session as any).requestToken = oauth_token;
    (req.session as any).requestTokenSecret = oauth_token_secret;

    res.redirect(authorizeUrl);
  } catch (error: any) {
    console.error('OAuth initiation error:', error);
    res.status(502).json({
      error: 'Failed to initiate OAuth with Wikimedia',
      message: error.message,
    });
  }
});

router.get('/callback', async (req: Request, res: Response) => {
  const { oauth_token, oauth_verifier } = req.query as {
    oauth_token?: string;
    oauth_verifier?: string;
  };

  const requestTokenSecret = (req.session as any)?.requestTokenSecret;

  if (!oauth_token || !oauth_verifier || !requestTokenSecret) {
    return res.status(400).json({
      error: 'Missing OAuth parameters or expired session',
      message: 'OAuth authorization could not be completed. Please try signing in again.',
    });
  }

  try {
    const accessToken = await exchangeAccessToken(oauth_token, oauth_verifier, requestTokenSecret);
    const userInfo = await getAuthenticatedUser(accessToken);

    (req.session as any).user = {
      username: userInfo.username,
      displayName: userInfo.displayName,
      accessToken,
    };

    // Clean up temporary request token
    delete (req.session as any).requestToken;
    delete (req.session as any).requestTokenSecret;

    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.status(500).json({
      error: 'OAuth exchange failed',
      message: error.message,
    });
  }
});

router.get('/me', (req: Request, res: Response) => {
  if ((req.session as any)?.user) {
    res.json({
      user: {
        username: (req.session as any).user.username,
        displayName: (req.session as any).user.displayName,
      },
    });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

router.all('/logout', (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');
    if (req.method === 'POST') {
      res.json({ message: 'Logged out successfully' });
    } else {
      res.redirect(frontendUrl || '/');
    }
  });
});

export default router;
