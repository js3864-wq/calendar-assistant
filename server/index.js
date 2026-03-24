require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Fail fast with a clear message if critical env vars are missing
const REQUIRED_ENV = ['SESSION_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI', 'ANTHROPIC_API_KEY'];
const missingCritical = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missingCritical.length > 0) {
  console.error('[startup] FATAL: Missing required environment variables:', missingCritical.join(', '));
  console.error('[startup] The server will start but affected features will not work.');
}

// Simple request logger
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} ${res.statusCode} ${ms}ms`);
  });
  next();
}

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy headers (required on Railway/Heroku/etc. for secure cookies)
app.set('trust proxy', 1);

// Allow both apex and www in production
const allowedOrigins = [
  'https://10xtakehome.com',
  'https://www.10xtakehome.com',
  // keep localhost for local development
  'http://localhost:5173',
];

app.use(cors({
  origin(origin, callback) {
    // allow non-browser requests or same-origin requests with no origin header
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-set-SESSION_SECRET-env-var',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProd,                // true in production (https)
    sameSite: isProd ? 'none' : 'lax', // required for cross-site cookies in prod
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use('/auth', require('./routes/auth'));
app.use('/calendar', require('./routes/calendar'));
app.use('/chat', require('./routes/chat'));

// Optional: quick health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'undefined' });
});

app.listen(process.env.PORT || 3001, () => {
  console.log(`Server running on port ${process.env.PORT || 3001}`);
});