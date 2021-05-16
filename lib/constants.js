const yup = require('yup');
const path = require('path');

require('dotenv').config();

const pageNotFound = path.join(__dirname, '../public/html/404.html');
const pageNewUrl = path.join(__dirname, '../public/html/newUrl.html');
const pageNewUser = path.join(__dirname, '../public/html/addUser.html');
const quietHTML = path.join(__dirname, '../public/html/quiet.html');
const privacyHTML = path.join(__dirname, '../public/html/privacy.html');

const schema = yup.object().shape({
  slug: yup.string().trim().matches(/[\w-]/i),
  url: yup.string().trim().url().required(),
});

const mongoURI = `${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongo/lwspw?authSource=admin`;
const monk = require('monk');
const db = monk(mongoURI);
db.then(() => console.log('Connected!'));

const urls = db.get('urls');
const users = db.get('users');
const failedRequests = db.get('failedRequests');

module.exports = {
  schema,
  db,
  urls,
  users,
  failedRequests,
  pageNotFound,
  pageNewUrl,
  pageNewUser,
  quietHTML,
  privacyHTML,
};
