const path = require('path');
const rfs = require('rotating-file-stream');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const errors = require('./middlewares/error');
const { cookieKey, environment } = require('./util/config');
const auth = environment === 'test' ? require('./middlewares/mockAuth') : require('./middlewares/auth');

const app = express();
const router = require('./router/router');

app.use(helmet());
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'log'),
});
app.use(morgan('combined', { stream: accessLogStream }));

app.use(express.json());
app.set('trust proxy');
app.use(
  session({
    name: 'sessionAuth',
    secret: cookieKey,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }, // 1 Day
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/failedLogin', (req, res) => res.status(401).json({ message: 'Authentication failed.' }));
app.use('/oauth', auth);

app.use(
  '/auth',
  slowDown({ windowMs: 30 * 1000, delayAfter: 3, delayMs: 500 }),
  rateLimit({ windowMs: 30 * 1000, max: 5 }),
  function (req, res, next) {
    if (req.user) {
      next();
    } else {
      res.redirect('/oauth/google');
    }
  },
);

app.use('/', router);

app.use(errors.notFound);
app.use(errors.errorHandler);

module.exports = app;
