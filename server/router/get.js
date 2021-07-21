const {
  schema,
  urls,
  pageNotFound,
} = require('../lib/constants');


async function getFromUrl(req, res, next) {
  let url = `https://${req.params.id}`
  try {
    const slug = await urls.findOne({url});
    if (slug) {
      return res.json(slug);
    }  
    await schema.validate({
      url,
    });
    return res.status(404).json({
      error: "Shortened domain not found."
    })
  } catch (error) {
    return res.status(404).json({
      error: "Unrecognized url format."
    })
  }
}

module.exports = { getFromSlug, getFromUrl };
