const { nanoid } = require('nanoid');
const { db, urls, schema, pageNewUser, users } = require('./lib/constants');

async function makeNewUrl(req, res, next) {
  let { slug, url } = req.body;
  try {
    await schema.validate({
      slug,
      url,
    });
    if (!slug) {
      slug = nanoid(5);
    }
    slug = slug.toLowerCase();
    const newUrl = {
      url,
      slug,
    };
    const created = await urls.insert(newUrl);
    res.json(created);
  } catch (error) {
    if (error.message.startsWith('E11000')) {
      error.message = 'Slug in use.🥠';
    }
    next(error);
  }
}

async function makeNewUser(req, res, next) {
  try {
    let userid = req.body;
    const created = await users.insert(userid);
    res.json(created);
  } catch (error) {
    error.message = 'Error creating user 🙀';
    next(error);
  }
}

module.exports = { makeNewUrl, makeNewUser };
