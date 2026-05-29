'use strict';

const express = require('express');
const router = express.Router();

const { contactValidationRules } = require('../utils/validators');
const { contactLimiter } = require('../middleware/rateLimiter');
const honeypot = require('../middleware/honeypot');
const { submitContact } = require('../controllers/contactController');

/**
 * POST /api/contact
 *  - rate-limited per IP
 *  - honeypot anti-spam check
 *  - field validation (express-validator)
 *  - main controller (validates, persists, notifies)
 */
router.post(
  '/contact',
  contactLimiter,
  honeypot,
  contactValidationRules,
  submitContact
);

// Health probe — useful for uptime monitors / hosting platforms
router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'zenova-backend', time: new Date().toISOString() });
});

module.exports = router;
