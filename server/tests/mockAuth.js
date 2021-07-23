const { Router } = require('express');
const router = Router();

const passport = require('passport');
const MockStrategy = require('passport-mock-strategy');

passport.use(
  new MockStrategy(
    {
      name: 'mock',
      user: { name: 'Authorized User', id: '1', _id: '1' },
      passReqToCallback: true,
    },
    (req, user, done) => {
      let name = req.body.user.name;
      if (name === user.name) {
        done(null, user);
      } else {
        done(null, false);
      }
    },
  ),
);

MockStrategy.setupSerializeAndDeserialize(
  passport,
  (id, done) => {
    done(null, id);
  },
  (id, done) => {
    done(null, id);
  },
);

router.get(
  '/google',
  passport.authenticate('mock', {
    successRedirect: '/auth/loggedIn',
    failureRedirect: '/failedLogin',
  }),
);

module.exports = router;
