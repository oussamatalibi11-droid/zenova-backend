'use strict';

/**
 * Honeypot anti-spam middleware.
 * Bots tend to fill every field. We add a hidden input the user never sees;
 * if it has a value, drop the request silently with a 200 OK so the bot
 * can't tell it failed.
 */

const config = require('../config/env');
const logger = require('../utils/logger');

module.exports = function honeypot(req, res, next) {
  const trap = req.body && req.body[config.antiSpam.honeypotField];
  if (trap && String(trap).trim() !== '') {
    logger.warn('Honeypot triggered', {
      ip: req.ip,
      ua: req.get('user-agent'),
    });
    // Lie to the bot: pretend it worked.
    return res.status(200).json({ success: true });
  }
  next();
};
