require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
}));

app.use('/auth', require('./routes/auth'));
app.use('/calendar', require('./routes/calendar'));
app.use('/chat', require('./routes/chat'));

app.listen(process.env.PORT || 3001, () =>
  console.log(`Server running on port ${process.env.PORT || 3001}`)
);
