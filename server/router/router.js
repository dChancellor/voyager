const { Router } = require('express');
const router = Router();

const { db, client } = require('../util/config');
const { cleanInputs, stripsWebAddress } = require('../util/helpers');

router.post('/auth/newUser', async (req, res, next) => {
  const { ops } = await db.addUser(req.body);
  if (ops) return res.send(ops[0]);
  return next(new Error('Error creating user 🙀'));
});

router.post('/auth/newSlug', async (req, res, next) => {
  if (req.body.url === client) return next(new Error('No recursion 🤚'));
  let { slug, url, forcedToRegenerate, error } = await cleanInputs(req.body.slug, req.body.url);
  if (error) return res.status(404).send({ message: error });
  let { ops } = await db.createNewSlug(slug, url);
  return res.status(200).send({ ...ops[0], forcedToRegenerate });
});

router.post('/url', async (req, res) => {
  let { url } = req.body;
  url = stripsWebAddress(url);
  const result = await db.getSlugsFromUrl(url);
  console.log(result);
  if (result.length > 0) return res.status(200).send(result);
  res.status(404).send({ message: 'Url not found' });
});

router.get('/:id', async (req, res) => {
  const { id: slug } = req.params;
  const result = await db.getUrlFromSlug(slug);
  if (result) return res.redirect(`https://${result.url}`);
  return res.status(404).send('Slug was not Found');
});

router.get('/', async (req, res) => {
  res.send({ message: '🎂' });
});

module.exports = router;
