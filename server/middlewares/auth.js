const { Router } = require('express');
const router = Router();

const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

const { db, googleAuthStrategy, client } = require('../util/config');
const { isUserAuthorized } = require('../util/helpers');

passport.use(new GoogleStrategy(googleAuthStrategy, isUserAuthorized));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (user, done) => {
  db.getUserById(user._id).then((user) => {
    done(null, user);
  });
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: client,
    failureRedirect: '/oauth/google',
  }),
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }));

module.exports = router;
