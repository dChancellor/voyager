const { Router, request } = require('express');
const router = Router();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { users, failedRequests } = require('../lib/constants');

require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    function googleAuthenicate(req, accessToken, refreshToken, profile, done) {
      // if no existing user, check database for approved user
      if (!req.user) {
        // Find user in database
        users.findOne({ userid: profile.id }).then((currentUser) => {
          if (currentUser) {
            done(null, currentUser);
            // Pass unauthorized if user not found in database
          } else {
            const failedUser = {
              id: profile.id,
              displayName: profile.displayName,
              email: profile.emails[0].value,
            };
            const created = failedRequests.insert(failedUser);
            done(null, false);
          }
        });
        // Existing user found
      } else {
        console.log('Token Found');
        return done(null, req.user);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  users.findOne(_id).then((user) => {
    done(null, user);
  });
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/new',
    failureRedirect: '/oauth/google',
  }),
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }),
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(`${process.env.DOMAIN}`);
});

module.exports = router;
