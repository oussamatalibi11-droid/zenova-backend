'use strict';

/**
 * Centralized environment loader & validator.
 * Loads .env once and exposes a typed config object.
 * Fails fast if a critical secret is missing in production.
 */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const bool = (v, def = false) => {
  if (v === undefined || v === null || v === '') return def;
  return String(v).toLowerCase() === 'true';
};
const num = (v, def) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};
const list = (v) =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const env = process.env.NODE_ENV || 'development';

const config = {
  env,
  isProd: env === 'production',
  port: num(process.env.PORT, 5000),

  cors: {
    origins: list(process.env.CORS_ORIGINS),
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: num(process.env.SMTP_PORT, 465),
    secure: bool(process.env.SMTP_SECURE, true),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  mail: {
    notifyTo: process.env.NOTIFY_EMAIL || 'zenova.digital1@gmail.com',
    fromName: process.env.MAIL_FROM_NAME || 'Zenova Agency',
    fromAddress: process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER,
  },

  whatsapp: {
    provider: (process.env.WHATSAPP_PROVIDER || 'meta').toLowerCase(),
    to: process.env.WHATSAPP_TO,
    meta: {
      token: process.env.META_WA_TOKEN,
      phoneNumberId: process.env.META_WA_PHONE_NUMBER_ID,
      templateName: process.env.META_WA_TEMPLATE_NAME,
      templateLang: process.env.META_WA_TEMPLATE_LANG || 'en_US',
    },
    twilio: {
      sid: process.env.TWILIO_ACCOUNT_SID,
      token: process.env.TWILIO_AUTH_TOKEN,
      from: process.env.TWILIO_WHATSAPP_FROM,
    },
  },

  antiSpam: {
    honeypotField: process.env.HONEYPOT_FIELD || 'website',
    rateLimitMax: num(process.env.RATE_LIMIT_MAX, 5),
    rateLimitWindowMs:
      num(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) * 60 * 1000,
  },
};

// Validate critical secrets in production — log warnings in dev so the
// developer keeps moving without a hard crash.
const required = [
  ['SMTP_USER', config.smtp.user],
  ['SMTP_PASS', config.smtp.pass],
  ['NOTIFY_EMAIL', config.mail.notifyTo],
];

const missing = required.filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  const msg = `[config] Missing required env vars: ${missing.join(', ')}`;
  if (config.isProd) {
    // eslint-disable-next-line no-console
    console.error(msg);
    process.exit(1);
  } else {
    // eslint-disable-next-line no-console
    console.warn(`${msg} — running in dev mode, continuing.`);
  }
}

module.exports = config;
