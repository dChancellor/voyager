require('dotenv').config();
const yup = require('yup');
const Database = require('../lib/database');

const environment = process.env.NODE_ENV;

const hostname = process.env.HOST;
const port = process.env.PORT;
const cookieKey = process.env.COOKIE_KEY;

const databases = {
  test: {
    host: process.env.JEST_MONGO_DB_HOST,
    user: process.env.JEST_MONGO_DB_USER,
    password: process.env.JEST_MONGO_DB_PASSWORD,
    database: process.env.JEST_MONGO_DB,
    uri: `mongodb://${process.env.JEST_MONGO_USERNAME}:${encodeURIComponent(process.env.JEST_MONGO_PASSWORD)}@${
      process.env.JEST_MONGO_HOST
    }:${process.env.JEST_MONGO_PORT}`,
  },
  development: {
    host: process.env.DEV_MONGO_HOST,
    port: process.env.DEV_MONGO_PORT,
    user: process.env.DEV_MONGO_USER,
    password: encodeURIComponent(process.env.DEV_MONGO_PASSWORD),
    database: process.env.DEV_MONGO_DB,
    uri: `mongodb://${process.env.DEV_MONGO_USERNAME}:${encodeURIComponent(process.env.DEV_MONGO_PASSWORD)}@${
      process.env.DEV_MONGO_HOST
    }:${process.env.DEV_MONGO_PORT}/${process.env.DEV_MONGO_DB}?authSource=admin`,
  },
  production: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    uri: `mongodb://${process.env.MONGO_USERNAME}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@${
      process.env.MONGO_HOST
    }:${process.env.MONGO_PORT}/${process.env.MONGO_DB}?authSource=admin`,
  },
};

const validUrlRegex =
  /^((ftp|http|https):\/\/)?(www.)?(?!.*(ftp|http|https|www.))[a-zA-Z0-9_-]+(\.[a-zA-Z]+)+((\/)[\w#]+)*(\/\w+\?[a-zA-Z0-9_]+=\w+(&[a-zA-Z0-9_]+=\w+)*)?$/gm;

const schema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/^[a-zA-Z0-9]+[a-zA-Z0-9-._]*[a-zA-Z0-9]+$/i),
  // .min(2)
  // .max(5),
  url: yup.string().matches(validUrlRegex, 'URL is not valid').required(),
});

let db = new Database(databases[environment].uri);

module.exports = { cookieKey, db, databases, schema, hostname, port, environment };
