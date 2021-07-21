const { Router } = require('express');
const router = Router();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { db, googleAuthStrategy } = require('../lib/config');

require('dotenv').config();

passport.use(
  new GoogleStrategy(googleAuthStrategy, async function googleAuthenicate(
    req,
    accessToken,
    refreshToken,
    profile,
    done,
  ) {
    if (req.user) return done(null, req.user);
    let user = await db.getUserById(profile.id);
    console.log('user from db', user);
    if (user) return done(null, user);
    const failedUser = {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
    };
    await db.addFailedLogin(failedUser);
    return done(null, false);
  }),
);

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: process.env.GOOGLE_CALLBACK_URL,
//       passReqToCallback: true,
//     },
//     function googleAuthenicate(req, accessToken, refreshToken, profile, done) {
//       // if no existing user, check database for approved user
//       if (!req.user) {
//         // Find user in database
//         db.getUserById(profile.id).then((currentUser) => {
//           console.log('HERE');
//           if (currentUser) {
//             console.log('CURRENT USER', currentUser);
//             done(null, currentUser);
//             // Pass unauthorized if user not found in database
//           } else {
//             const failedUser = {
//               id: profile.id,
//               displayName: profile.displayName,
//               email: profile.emails[0].value,
//             };
//             console.log(failedUser);
//             const created = db.addFailedLogin(failedUser);
//             done(null, false);
//           }
//         });
//         // Existing user found
//       } else {
//         console.log('Token Found');
//         return done(null, req.user);
//       }
//     },
//   ),
// );

passport.serializeUser((user, done) => {
  console.log('serialize user', user);
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  console.log('DE-ID', id);
  db.getUserById(id).then((user) => {
    done(null, user);
  });
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: '/auth/newSlug',
    failureRedirect: '/oauth/google',
  }),
);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email', 'openid'] }));

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect(`${process.env.DOMAIN}`);
});

module.exports = router;
