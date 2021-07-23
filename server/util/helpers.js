const { nanoid } = require('nanoid');
const { schema } = require('./config');
const { db } = require('./config');

async function schemaValidation(slug, url, forcedToRegenerate = false) {
  url = stripsWebAddress(url);
  let valid = await schema.isValid({ slug, url });
  if (!slug || !valid) slug = nanoid(5);
  slug = slug.toLowerCase();
  let doesAlreadyExist = await db.getUrlFromSlug(slug);
  if (doesAlreadyExist) return schemaValidation(undefined, url, true);
  return { slug, url, forcedToRegenerate };
}

function stripsWebAddress(url) {
  url = url.replace(/^https?:\/\//, '');
  url = url.replace(/^(www\.)?/, '');
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


module.exports = { schemaValidation, isUserAuthorized };
