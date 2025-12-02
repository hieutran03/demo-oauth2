import { Router, Request, Response } from 'express';
import axios from 'axios';
import config from '../config';

const router = Router();

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  const tokens = req.session.tokens;

  if (!tokens || !tokens.refreshToken) {
    return res.status(400).json({ error: 'No refresh token available' });
  }

  try {
    const response = await axios.post(
      `${config.oauthServerUrl}/api/v1/oauth/token`,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    req.session.tokens = response.data.data;
    res.json({ success: true, tokens: response.data.data });
  } catch (err: any) {
    console.error('Refresh error:', err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data?.error || err.message });
  }
});

// Get user info using access token
router.get('/userinfo', async (req: Request, res: Response) => {
  const tokens = req.session.tokens;

  if (!tokens || !tokens.accessToken) {
    return res.status(401).json({ error: 'No access token available' });
  }

  try {
    const response = await axios.get(
      `${config.oauthServerUrl}/api/v1/oauth/authenticate`,
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );

    res.json(response.data);
  } catch (err: any) {
    console.error('User info error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error || err.message,
    });
  }
});

// Revoke token
router.post('/revoke', async (req: Request, res: Response) => {
  const tokens = req.session.tokens;
  const { tokenType } = req.body as { tokenType?: string };

  if (!tokens) {
    return res.status(400).json({ error: 'No tokens available' });
  }

  const tokenToRevoke =
    tokenType === 'refresh' ? tokens.refreshToken : tokens.accessToken;

  try {
    await axios.post(
      `${config.oauthServerUrl}/api/v1/oauth/revoke`,
      new URLSearchParams({
        token: tokenToRevoke || '',
        token_type_hint: tokenType === 'refresh' ? 'refresh_token' : 'access_token',
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    res.json({ success: true, message: 'Token revoked' });
  } catch (err: any) {
    console.error('Revoke error:', err.response?.data || err.message);
    res.status(400).json({ error: err.response?.data?.error || err.message });
  }
});

// Register client on OAuth server
router.post('/register-client', async (req: Request, res: Response) => {
  try {
    const response = await axios.post(
      `${config.oauthServerUrl}/api/v1/oauth/client`,
      {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        callbackUrl: config.callbackUrl,
        grants: ['authorization_code', 'refresh_token'],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err: any) {
    console.error('Register client error:', err.response?.data || err.message);
    res.status(err.response?.status || 500).json({
      error: err.response?.data?.error || err.message,
    });
  }
});

export default router;
