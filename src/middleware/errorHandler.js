'use strict';

/**
 * Update the error handler to honor `err.localizedMessage` set by controllers.
 * Falls back to a generic English message if a non-localized error bubbles up.
 */

const logger = require('../utils/logger');
const { t, normalizeLang } = require('../locales');

const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const lang = normalizeLang(err.language || req.body?.language);

  logger.error('Unhandled error:', {
    message: err.message,
    status,
    path: req.originalUrl,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });

  const message =
    err.localizedMessage ||
    (status >= 500
      ? t(lang, 'api.serverError')
      : err.message || t(lang, 'api.serverError'));

  res.status(status).json({
    success: false,
    language: lang,
    message,
  });
};

module.exports = { notFound, errorHandler };
