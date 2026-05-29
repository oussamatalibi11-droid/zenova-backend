'use strict';

/**
 * Email service — Nodemailer + Gmail SMTP (App Password).
 * Two operations: notify-admin and confirm-client.
 * Both run via Promise.allSettled so one failure does not block the other.
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('../utils/logger');
const {
  notificationEmail,
  confirmationEmail,
} = require('./templates');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // true on 465, false on 587
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });
  return transporter;
};

/** Verify SMTP creds at boot — log only, do not crash. */
const verify = async () => {
  try {
    await getTransporter().verify();
    logger.info('SMTP transporter ready');
  } catch (err) {
    logger.warn('SMTP verify failed:', err.message);
  }
};

const fromAddress = `"${config.mail.fromName}" <${config.mail.fromAddress}>`;

const sendNotification = async (data) => {
  const { subject, text, html } = notificationEmail(data);
  return getTransporter().sendMail({
    from: fromAddress,
    to: config.mail.notifyTo,
    replyTo: `"${data.fullName}" <${data.email}>`,
    subject,
    text,
    html,
  });
};

const sendConfirmation = async (data, lang) => {
  const { subject, text, html } = confirmationEmail(data, lang);
  return getTransporter().sendMail({
    from: fromAddress,
    to: data.email,
    subject,
    text,
    html,
  });
};

/**
 * Fire both emails in parallel. Returns a results object the caller
 * can log without blocking the user response.
 */
const sendAll = async (data, lang) => {
  const [notify, confirm] = await Promise.allSettled([
    sendNotification(data),
    sendConfirmation(data, lang),
  ]);

  if (notify.status === 'rejected') {
    logger.error('Notification email failed:', notify.reason?.message);
  }
  if (confirm.status === 'rejected') {
    logger.error('Confirmation email failed:', confirm.reason?.message);
  }

  return {
    notificationSent: notify.status === 'fulfilled',
    confirmationSent: confirm.status === 'fulfilled',
  };
};

module.exports = { verify, sendAll, sendNotification, sendConfirmation };
