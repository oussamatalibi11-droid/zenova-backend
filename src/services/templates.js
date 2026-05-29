'use strict';

/**
 * Template builders — produce subject/text/html for each kind of message
 * by reading strings from the locales/ directory. No hard-coded copy here.
 */

const { getLocale, serviceLabel, normalizeLang } = require('../locales');

const escape = (s = '') =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatDate = (d, lang) => {
  const loc = getLocale(lang);
  return new Intl.DateTimeFormat(loc.dateLocale, {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Casablanca',
  }).format(d);
};

// ───────────────────────── Internal admin notification (always EN) ─────────────────────────
const notificationEmail = (data) => {
  const lang = 'en';
  const L = getLocale(lang).notification;
  const submittedAt = formatDate(new Date(), lang);
  const subject = `🚀 ${L.subjectPrefix} — ${data.fullName} (${serviceLabel(lang, data.service)})`;

  const text = [
    `${L.headline}`,
    '─────────────────',
    `${L.labels.name}:      ${data.fullName}`,
    `${L.labels.email}:     ${data.email}`,
    `${L.labels.phone}:     ${data.phone}`,
    `${L.labels.company}:   ${data.company || '—'}`,
    `${L.labels.service}:   ${serviceLabel(lang, data.service)}`,
    `${L.labels.language}:  ${(data.language || 'en').toUpperCase()}`,
    `${L.labels.submitted}: ${submittedAt}`,
    '',
    `${L.sectionMessage}:`,
    data.message,
  ].join('\n');

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#0a0b14;color:#f5f5f7;padding:24px">
    <div style="max-width:560px;margin:auto;background:#11131e;border:1px solid rgba(123,47,255,.25);border-radius:8px;overflow:hidden">
      <div style="background:linear-gradient(135deg,#7b2fff 0%,#e040fb 100%);padding:18px 24px">
        <h2 style="margin:0;color:#fff;font-size:18px;letter-spacing:.05em">🚀 ${escape(L.headline)}</h2>
      </div>
      <div style="padding:24px">
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#e8e8ee">
          <tr><td style="padding:6px 0;color:#9aa0b4;width:110px">${escape(L.labels.name)}</td><td>${escape(data.fullName)}</td></tr>
          <tr><td style="padding:6px 0;color:#9aa0b4">${escape(L.labels.email)}</td><td><a href="mailto:${escape(data.email)}" style="color:#e040fb">${escape(data.email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#9aa0b4">${escape(L.labels.phone)}</td><td><a href="tel:${escape(data.phone)}" style="color:#e040fb">${escape(data.phone)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#9aa0b4">${escape(L.labels.company)}</td><td>${escape(data.company || '—')}</td></tr>
          <tr><td style="padding:6px 0;color:#9aa0b4">${escape(L.labels.service)}</td><td>${escape(serviceLabel(lang, data.service))}</td></tr>
          <tr><td style="padding:6px 0;color:#9aa0b4">${escape(L.labels.language)}</td><td>${escape((data.language || 'en').toUpperCase())}</td></tr>
          <tr><td style="padding:6px 0;color:#9aa0b4">${escape(L.labels.submitted)}</td><td>${escape(submittedAt)}</td></tr>
        </table>
        <hr style="border:0;border-top:1px solid rgba(255,255,255,.08);margin:18px 0"/>
        <h3 style="margin:0 0 8px;color:#e040fb;font-size:13px;letter-spacing:.1em;text-transform:uppercase">${escape(L.sectionMessage)}</h3>
        <p style="white-space:pre-wrap;line-height:1.6;color:#e8e8ee;margin:0">${escape(data.message)}</p>
      </div>
      <div style="padding:14px 24px;background:#0a0b14;color:#6b6f80;font-size:11px;text-align:center">
        ${escape(L.footer)}
      </div>
    </div>
  </div>`;

  return { subject, text, html };
};

// ───────────────────────── Client confirmation (localized) ─────────────────────────
const confirmationEmail = (data, langInput) => {
  const lang = normalizeLang(langInput);
  const loc = getLocale(lang);
  const t = loc.confirmation;
  const dir = loc.dir;
  const align = dir === 'rtl' ? 'right' : 'left';

  const text = [
    t.title,
    '',
    t.body,
    '',
    t.summary,
    `${t.labels.name}: ${data.fullName}`,
    `${t.labels.email}: ${data.email}`,
    `${t.labels.phone}: ${data.phone}`,
    `${t.labels.company}: ${data.company || '—'}`,
    `${t.labels.service}: ${serviceLabel(lang, data.service)}`,
    `${t.labels.message}: ${data.message}`,
    '',
    t.closing,
    t.team,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head><meta charset="utf-8"/><title>${escape(t.subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f7">
  <div dir="${dir}" style="font-family:Arial,Helvetica,sans-serif;background:#f5f5f7;padding:24px;text-align:${align}">
    <div style="max-width:560px;margin:auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.08)">
      <div style="background:linear-gradient(135deg,#7b2fff 0%,#e040fb 100%);padding:28px 24px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:.04em">ZENOVA AGENCY</h1>
      </div>
      <div style="padding:28px 24px;color:#1a1b26">
        <h2 style="margin:0 0 14px;font-size:20px;color:#1a1b26">${escape(t.title)}</h2>
        <p style="margin:0 0 18px;line-height:1.7;color:#3a3d4d;font-size:15px">${escape(t.body)}</p>
        <hr style="border:0;border-top:1px solid #ececf2;margin:22px 0"/>
        <p style="margin:0 0 12px;color:#6b6f80;font-size:13px">${escape(t.summary)}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#1a1b26">
          <tr><td style="padding:5px 0;color:#6b6f80;width:130px">${escape(t.labels.name)}</td><td>${escape(data.fullName)}</td></tr>
          <tr><td style="padding:5px 0;color:#6b6f80">${escape(t.labels.email)}</td><td>${escape(data.email)}</td></tr>
          <tr><td style="padding:5px 0;color:#6b6f80">${escape(t.labels.phone)}</td><td>${escape(data.phone)}</td></tr>
          <tr><td style="padding:5px 0;color:#6b6f80">${escape(t.labels.company)}</td><td>${escape(data.company || '—')}</td></tr>
          <tr><td style="padding:5px 0;color:#6b6f80">${escape(t.labels.service)}</td><td>${escape(serviceLabel(lang, data.service))}</td></tr>
          <tr><td style="padding:5px 0;color:#6b6f80;vertical-align:top">${escape(t.labels.message)}</td><td style="white-space:pre-wrap">${escape(data.message)}</td></tr>
        </table>
        <p style="margin:26px 0 0;color:#3a3d4d;font-size:14px">
          ${escape(t.closing)}<br/>
          <strong>${escape(t.team)}</strong>
        </p>
      </div>
      <div style="padding:16px;background:#0a0b14;color:#9aa0b4;font-size:11px;text-align:center">
        © ${new Date().getFullYear()} Zenova Agency
      </div>
    </div>
  </div>
</body></html>`;

  return { subject: t.subject, text, html };
};

// ───────────────────────── WhatsApp body ─────────────────────────
const whatsappText = (data) => {
  const lang = 'en';
  return [
    'New Website Lead 🚀',
    '',
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Company: ${data.company || '-'}`,
    `Service: ${serviceLabel(lang, data.service)}`,
    `Message: ${data.message}`,
    `Language: ${(data.language || 'en').toUpperCase()}`,
  ].join('\n');
};

module.exports = { notificationEmail, confirmationEmail, whatsappText };
