const { nanoid } = require('nanoid');
const { validateSchema } = require('./config');
const { db } = require('./config');

async function cleanInputs(slug, url, forcedToRegenerate = false) {
  url = stripsWebAddress(url);
  let { valid, error } = await validateSchema({ slug, url });
  if (error) return { error };
  if (!slug || !valid) slug = nanoid(5);
  slug = slug.toLowerCase();
  let doesAlreadyExist = await db.getUrlFromSlug(slug);
  if (doesAlreadyExist) return cleanInputs(undefined, url, true);
  return { slug, url, forcedToRegenerate };
}

function stripsWebAddress(url) {
  url = url.replace(/^https?:\/\//, '') || url;
  url = url.replace(/^(www\.)?/, '') || url;
  return url;
}

async function isUserAuthorized(_, __, ___, profile, done) {
  let user = await db.getUserByGoogleId(profile.id);
  if (user) return done(null, user);
  const failedUser = {
    id: profile.id,
    displayName: profile.displayName,
    email: profile.emails[0].value,
  };
  await db.addFailedLogin(failedUser);
  return done(null, false);
}

module.exports = { cleanInputs, isUserAuthorized, stripsWebAddress };
