const express = require('express');
const { getTwoWeekEvents } = require('../services/googleCalendar');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.get('/events', requireAuth, async (req, res) => {
  try {
    const events = await getTwoWeekEvents(req.session.tokens);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
