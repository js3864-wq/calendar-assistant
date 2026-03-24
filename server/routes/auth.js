const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

const requiredEnv = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'CLIENT_URL',
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error('[auth] Missing required env vars:', missingEnv.join(', '));
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

function disableCache(res) {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Surrogate-Control': 'no-store',
  });
}

// Redirect to Google login
router.get('/google', (req, res) => {
  try {
    disableCache(res);

    if (missingEnv.length > 0) {
      return res.status(500).json({
        error: `Server misconfiguration. Missing env vars: ${missingEnv.join(', ')}`,
      });
    }

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });

    return res.redirect(url);
  } catch (err) {
    console.error('[auth/google] Failed to generate auth URL:', err);
    return res.status(500).json({ error: err.message || 'Failed to start Google OAuth' });
  }
});

// Handle callback
router.get('/google/callback', async (req, res) => {
  try {
    disableCache(res);

    if (missingEnv.length > 0) {
      return res.status(500).json({
        error: `Server misconfiguration. Missing env vars: ${missingEnv.join(', ')}`,
      });
    }

    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ error: 'Missing OAuth code in query params' });
    }

    const { tokens } = await oauth2Client.getToken(code);
    // Google only returns a refresh_token on first consent. Preserve any existing one.
    if (!tokens.refresh_token && req.session.tokens?.refresh_token) {
      tokens.refresh_token = req.session.tokens.refresh_token;
    }
    req.session.tokens = tokens;

    // Ensure session is persisted before redirecting back to frontend
    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('[auth/google/callback] Session save error:', saveErr);
        return res.status(500).json({ error: 'Failed to save session' });
      }
      return res.redirect(`${process.env.CLIENT_URL || ''}/calendar`);
    });
  } catch (err) {
    console.error('[auth/google/callback] OAuth callback error:', err);
    return res.status(500).json({ error: err.message || 'Google OAuth callback failed' });
  }
});

// Check session
router.get('/status', (req, res) => {
  disableCache(res);
  res.json({ authenticated: !!req.session.tokens });
});

// Logout
router.post('/logout', (req, res) => {
  disableCache(res);
  req.session.destroy((err) => {
    if (err) {
      console.error('[auth/logout] Session destroy error:', err);
      return res.status(500).json({ error: 'Failed to log out' });
    }
    return res.json({ success: true });
  });
});

module.exports = router;
