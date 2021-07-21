const { Router } = require('express');
const router = Router();

const { db, client } = require('../lib/config');
const { schemaValidation } = require('../lib/helpers');

router.post('/post/newUser', async (req, res) => {
  const { ops } = await db.addUser(req.body);
  if (ops) return res.send(ops[0]);
  res.status(500).send({ message: 'Error creating user 🙀' });
});

router.post('/post/newSlug', async (req, res) => {
  if (req.body.url === client) return res.status(500).send({ message: 'No recursion 🤚' });
  let { slug, url, forcedToRegenerate } = await schemaValidation(req.body.slug, req.body.url);
  let { ops } = await db.createNewSlug(slug, url);
  if (ops) return res.send({ ...ops[0], forcedToRegenerate });
  res.status(404).send({ message: 'Something went wrong' });
});

router.get('/url', async (req, res) => {
  const { url } = req.body;
  console.log(url);
  const result = await db.getSlugsFromUrl(url);
  if (result.length > 0) return res.status(200).send(result);
  res.status(404).send({ message: 'Url not found' });
});

router.get('/:id', async (req, res) => {
  const { id: slug } = req.params;
  const result = await db.getUrlFromSlug(slug);
  if (result) return res.redirect(result.url);
  return res.status(404).send('Slug was not Found');
});

router.get('/', async (_, res) => {
  res.send({ message: '🎂' });
});
module.exports = router;
