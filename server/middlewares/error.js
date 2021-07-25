function notFound(req, res, next) {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.status = 404;
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
  });
}

module.exports = { notFound, errorHandler };
