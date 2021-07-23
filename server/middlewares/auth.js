const { Router } = require('express');
const router = Router();

const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

const { db, googleAuthStrategy, client } = require('../util/config');
const { isUserAuthorized } = require('../util/helpers');

passport.use(new GoogleStrategy(googleAuthStrategy, isUserAuthorized));

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (_id, done) => {
  db.getUserById(_id).then(({ id }) => {
    done(null, id);
  });
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/loggedIn',
    failureRedirect: '/oauth/google',
  }),
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(client);
});

module.exports = router;
