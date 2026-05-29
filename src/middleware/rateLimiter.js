'use strict';

/**
 * Per-route rate limiter for the contact endpoint.
 * Defaults: 5 requests / 10 minutes / IP.
 * Tweak in .env via RATE_LIMIT_MAX and RATE_LIMIT_WINDOW_MINUTES.
 */

const rateLimit = require('express-rate-limit');
const config = require('../config/env');

const contactLimiter = rateLimit({
  windowMs: config.antiSpam.rateLimitWindowMs,
  max: config.antiSpam.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
});

module.exports = { contactLimiter };
