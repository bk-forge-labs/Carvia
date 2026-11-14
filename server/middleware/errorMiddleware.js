exports.notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not found - ${req.originalUrl}`));
};

exports.errorHandler = (err, req, res, next) => {
  const statusCode =
    (err.name === 'VersionError' ? 409 : err.statusCode) ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  return res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 && !err.isOperational ? 'Service unavailable. Please try again.' : err.name === 'VersionError' ? 'This record changed. Refresh and try again.' : err.message || 'Request failed',
  });
};
