const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Redirect to Google login
router.get('/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
  res.redirect(url);
});

// Handle callback
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    res.redirect(process.env.CLIENT_URL);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check session
router.get('/status', (req, res) => {
  res.json({ authenticated: !!req.session.tokens });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

module.exports = router;
