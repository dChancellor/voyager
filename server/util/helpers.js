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

module.exports = { schemaValidation };
