const { Router, request, response } = require('express');
const router = Router();

const { inputNewUrl, inputNewUser } = require('./get');
const { makeNewUrl, makeNewUser } = require('./post');

router.get('/new', inputNewUrl);
router.get('/addUser', inputNewUser);

router.post('/addUser', makeNewUser);
router.post('/url', makeNewUrl);

module.exports = router;
