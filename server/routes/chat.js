const express = require('express');
const rateLimit = require('express-rate-limit');
const { z } = require('zod');
const { streamAgentTurn } = require('../services/calendarAgent');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20,             // 20 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait a moment before trying again.' },
});

const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.union([z.string(), z.array(z.any())]),
});

const chatBodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(200),
});

// Keep the last N messages to avoid bloated payloads on long conversations
const MAX_HISTORY_MESSAGES = 20;

router.post('/message', requireAuth, chatLimiter, async (req, res) => {
  const parsed = chatBodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request body', details: parsed.error.flatten() });
  }

  let { messages } = parsed.data;
  if (messages.length > MAX_HISTORY_MESSAGES) {
    messages = messages.slice(messages.length - MAX_HISTORY_MESSAGES);
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx proxy buffering
  res.flushHeaders();

  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { updatedMessages } = await streamAgentTurn(messages, req.session.tokens, sendEvent);
    sendEvent({ type: 'done', updatedMessages });
  } catch (err) {
    console.error('[chat] Agent error:', err);
    sendEvent({ type: 'error', error: err.message || 'Something went wrong.' });
  } finally {
    res.end();
  }
});

module.exports = router;
