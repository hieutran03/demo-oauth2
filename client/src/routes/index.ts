import { Router, Request, Response } from 'express';
import axios from 'axios';
import config from '../config';

const router = Router();

// Home page
router.get('/', (req: Request, res: Response) => {
  res.render('index', {
    config,
    user: req.session.user || null,
    tokens: req.session.tokens || null,
  });
});

// Start OAuth2 flow - redirect to authorization server
router.get('/login', (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  req.session.oauthState = state;

  const authUrl = new URL(`${config.oauthServerUrl}/api/v1/oauth/authorize`);
  authUrl.searchParams.set('client_id', config.clientId);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('redirect_uri', config.callbackUrl);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', 'read write');

  console.log('Redirecting to:', authUrl.toString());
  res.redirect(authUrl.toString());
});

// OAuth2 callback - exchange code for tokens
router.get('/callback', async (req: Request, res: Response) => {
  const { code, state, error } = req.query as {
    code?: string;
    state?: string;
    error?: string;
  };

  if (error) {
    return res.render('error', { error: `OAuth Error: ${error}` });
  }

  // Verify state
  if (state !== req.session.oauthState) {
    return res.render('error', { error: 'Invalid state parameter' });
  }

  if (!code) {
    return res.render('error', { error: 'No authorization code received' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await axios.post(
      `${config.oauthServerUrl}/api/v1/oauth/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: config.callbackUrl,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const tokens = tokenResponse.data.data;
    req.session.tokens = tokens;

    console.log('Tokens received:', tokens);

    // Get user info
    try {
      const userResponse = await axios.get(
        `${config.oauthServerUrl}/api/v1/oauth/authenticate`,
        {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        }
      );
      req.session.user = userResponse.data.data;
    } catch (userErr: any) {
      console.error('Failed to get user info:', userErr.message);
    }

    res.redirect('/');
  } catch (err: any) {
    console.error('Token exchange error:', err.response?.data || err.message);
    res.render('error', {
      error: `Token exchange failed: ${err.response?.data?.error || err.message}`,
    });
  }
});

// Logout
router.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destroy error:', err);
    res.redirect('/');
  });
});

export default router;
