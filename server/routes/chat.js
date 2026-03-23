const express = require('express');
const { runAgentTurn } = require('../services/calendarAgent');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.post('/message', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;
    const { reply, updatedMessages } = await runAgentTurn(messages, req.session.tokens);
    res.json({ reply, updatedMessages });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;