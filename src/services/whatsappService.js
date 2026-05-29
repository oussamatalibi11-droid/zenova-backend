'use strict';

/**
 * WhatsApp service — supports two providers, picked via WHATSAPP_PROVIDER env:
 *   - "meta"   → Meta WhatsApp Cloud API (recommended, free tier)
 *   - "twilio" → Twilio WhatsApp API
 *
 * Note on Meta Cloud API: when sending OUTSIDE a 24h customer window
 * (which is our case — we initiate the message), Meta requires a
 * pre-approved TEMPLATE message. This file supports both:
 *   - Plain text (works inside 24h window or in dev)
 *   - Template message (production) — see README for setup.
 */

const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const { whatsappText } = require('./templates');

const sendViaMeta = async (toE164, text, leadData) => {
  const { token, phoneNumberId, templateName, templateLang } =
    config.whatsapp.meta;

  if (!token || !phoneNumberId) {
    throw new Error('Meta WhatsApp not configured');
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  const to = toE164.replace(/^\+/, ''); // Meta wants no leading +

  // Strategy: try TEMPLATE first (works 24/7), fall back to plain text.
  // Template must be pre-approved with the same number of {{N}} body params.
  const tryTemplate = async () => {
    if (!templateName) throw new Error('no template configured');
    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: templateLang || 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: leadData.fullName },
              { type: 'text', text: leadData.email },
              { type: 'text', text: leadData.phone },
              { type: 'text', text: leadData.company || '-' },
              { type: 'text', text: leadData.service },
              { type: 'text', text: leadData.message.slice(0, 800) },
              { type: 'text', text: (leadData.language || 'en').toUpperCase() },
            ],
          },
        ],
      },
    };
    return axios.post(url, body, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
  };

  const tryText = async () => {
    const body = {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    };
    return axios.post(url, body, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });
  };

  try {
    const res = await tryTemplate();
    return { ok: true, provider: 'meta', mode: 'template', id: res.data };
  } catch (e) {
    logger.warn(
      'Meta template send failed, trying plain text:',
      e.response?.data || e.message
    );
    const res = await tryText();
    return { ok: true, provider: 'meta', mode: 'text', id: res.data };
  }
};

const sendViaTwilio = async (toE164, text) => {
  const { sid, token, from } = config.whatsapp.twilio;
  if (!sid || !token || !from) {
    throw new Error('Twilio WhatsApp not configured');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const params = new URLSearchParams({
    To: `whatsapp:${toE164}`,
    From: from,
    Body: text,
  });

  const res = await axios.post(url, params, {
    auth: { username: sid, password: token },
    timeout: 10000,
  });
  return { ok: true, provider: 'twilio', id: res.data?.sid };
};

const sendLead = async (leadData) => {
  const to = config.whatsapp.to;
  if (!to) {
    logger.warn('WHATSAPP_TO not set — skipping WhatsApp notification');
    return { ok: false, skipped: true };
  }
  const text = whatsappText(leadData);

  try {
    if (config.whatsapp.provider === 'twilio') {
      return await sendViaTwilio(to, text);
    }
    return await sendViaMeta(to, text, leadData);
  } catch (err) {
    logger.error(
      'WhatsApp send failed:',
      err.response?.data || err.message
    );
    return { ok: false, error: err.message };
  }
};

module.exports = { sendLead };
