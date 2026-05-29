'use strict';

/**
 * Contact form controller.
 *
 * Flow:
 *  1) Read client language from body (already validated/sanitized)
 *  2) If express-validator collected errors, translate keys → localized messages
 *  3) Persist the submission
 *  4) Fire emails + WhatsApp (parallel, non-blocking on individual failures)
 *  5) Return localized success message
 */

const { validationResult } = require('express-validator');
const { t, normalizeLang } = require('../locales');
const emailService = require('../services/emailService');
const whatsappService = require('../services/whatsappService');
const storageService = require('../services/storageService');
const logger = require('../utils/logger');

const submitContact = async (req, res, next) => {
  const lang = normalizeLang(req.body.language);

  // 1. Validation errors → localized response
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const fieldErrors = {};
    for (const e of errors.array({ onlyFirstError: true })) {
      // e.msg is a translation key like "email.invalid"
      fieldErrors[e.path] = t(lang, `validation.${e.msg}`);
    }
    return res.status(400).json({
      success: false,
      language: lang,
      message: t(lang, 'api.validationError'),
      errors: fieldErrors,
    });
  }

  // 2. Build a clean payload (only the fields we care about)
  const payload = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    company: req.body.company || '',
    service: req.body.service,
    message: req.body.message,
    language: lang,
    meta: {
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
    },
  };

  try {
    // 3. Persist
    const record = await storageService.saveSubmission(payload);

    // 4. Notifications (parallel — failures logged, do not block user)
    const [emailRes, waRes] = await Promise.allSettled([
      emailService.sendAll(payload, lang),
      whatsappService.sendLead(payload),
    ]);

    logger.info('Contact submission processed', {
      id: record.id,
      lang,
      email:
        emailRes.status === 'fulfilled'
          ? emailRes.value
          : { error: emailRes.reason?.message },
      whatsapp:
        waRes.status === 'fulfilled'
          ? waRes.value
          : { error: waRes.reason?.message },
    });

    // 5. Localized success
    return res.status(200).json({
      success: true,
      language: lang,
      message: t(lang, 'api.success'),
      id: record.id,
    });
  } catch (err) {
    logger.error('submitContact failed:', err);
    err.localizedMessage = t(lang, 'api.serverError');
    err.language = lang;
    return next(err);
  }
};

module.exports = { submitContact };
