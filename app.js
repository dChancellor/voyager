const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

require('dotenv').config();

const api = require('./api/router');
const initialize = require('./database/init');
initialize();
const errors = require('./middlewares/error');
const auth = require('./middlewares/auth');
const { getFromSlug, serenity, getFromUrl, privacy } = require('./api/get');

const app = express();

app.enable('trust proxy');
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(morgan('tiny'));
app.use(express.json());

app.use(express.static('./public'));
app.use(
  session({
    name: 'sessionAuth',
    secret: process.env.COOKIE_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('./public/html'));

app.use('/find/:id', getFromUrl);
app.use('/quiet', serenity);
app.use('/privacy', privacy);

app.use('/oauth', auth);
app.use(
  '/auth',
  slowDown({
    windowMs: 30 * 1000,
    delayAfter: 3,
    delayMs: 500,
  }),
  rateLimit({
    windowMs: 30 * 1000,
    max: 5,
  }),
  function (req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/oauth/google');
    }
  },
);
app.use('/auth', api);
app.use('/:id', getFromSlug);

app.use(errors.notFound);
app.use(errors.errorHandler);

module.exports = app;




