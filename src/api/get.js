const {
  schema,
  urls,
  pageNotFound,
  pageNewUrl,
  pageNewUser,
  quietHTML,
  privacyHTML,
} = require('../lib/constants');

async function getFromSlug(req, res, next) {
  const { id: slug } = req.params;
  try {
    const url = await urls.findOne({ slug });
    if (url) {
      return res.redirect(url.url);
    }
    return res.status(404).sendFile(pageNotFound);
  } catch (error) {
    return res.status(404).sendFile(pageNotFound);
  }
}

async function getFromUrl(req, res, next) {
  let url = `https://${req.params.id}`;
  try {
    const slug = await urls.findOne({ url });
    if (slug) {
      return res.json(slug);
    }
    await schema.validate({
      url,
    });
    return res.status(404).json({
      error: 'Shortened domain not found.',
    });
  } catch (error) {
    return res.status(404).json({
      error: 'Unrecognized url format.',
    });
  }
}

function serenity(req, res, next) {
  return res.sendFile(quiet);
}

function privacy(req, res, next) {
  return res.sendFile(privacyHTML);
}
function inputNewUrl(req, res, next) {
  return res.sendFile(pageNewUrl);
}

function inputNewUser(req, res, next) {
  return res.sendFile(pageNewUser);
}
module.exports = {
  getFromSlug,
  inputNewUrl,
  inputNewUser,
  serenity,
  getFromUrl,
  privacy,
};
