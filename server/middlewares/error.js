const { paths, environment } = require('../lib/config');

function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404).sendFile(paths.notFound);
  next(error);
}

function errorHandler(error, req, res, next) {
  if (error.status) {
    res.status(error.status);
  } else {
    res.status(500);
  }
  res.json({
    message: error.message,
    stack: environment === 'production' ? 'Oops! There was an error!' : error.stack,
  });
}

module.exports = { notFound, errorHandler };
