const { cookieKey } = require('./lib/config');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const errors = require('./middlewares/error');

const app = express();
const router = require('./router/router');

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

// Do I need this?
// app.set('trust proxy', 1)
// app.use(
//   session({
//     name: 'sessionAuth',
//     secret: cookieKey,
//     resave: true,
//     saveUninitialized: true,
//     cookie: { secure: true, httpOnly: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 Day
//   }),
// );

// app.use(passport.initialize());
// app.use(passport.session());

// app.use(
//   '/auth',
//   slowDown({ windowMs: 30 * 1000, delayAfter: 3, delayMs: 500 }),
//   rateLimit({ windowMs: 30 * 1000, max: 5 }),
//   function (req, res, next) {
//     if (req.user) {
//       next();
//     } else {
//       res.redirect('/oauth/google');
//     }
//   },
// );

app.use('/', router);

app.use(errors.notFound);
app.use(errors.errorHandler);

module.exports = app;
