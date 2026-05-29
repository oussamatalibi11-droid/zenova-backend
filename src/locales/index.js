'use strict';

/**
 * i18n helper / translation service.
 *
 *   const { t, getLocale, normalizeLang, SUPPORTED } = require('./locales');
 *   t('ar', 'api.success')
 *   t('fr', 'validation.email.invalid')
 *
 * Adding a new language: create src/locales/<code>.js and register it
 * in the LOCALES map below. Everything else (controller, emails, validation)
 * picks it up automatically.
 */

const en = require('./en');
const fr = require('./fr');
const ar = require('./ar');

const LOCALES = { en, fr, ar };
const DEFAULT_LANG = 'en';
const SUPPORTED = Object.keys(LOCALES);

/** Coerce arbitrary input into a supported lang code. */
const normalizeLang = (input) => {
  if (!input) return DEFAULT_LANG;
  const code = String(input).toLowerCase().slice(0, 2);
  return SUPPORTED.includes(code) ? code : DEFAULT_LANG;
};

const getLocale = (lang) => LOCALES[normalizeLang(lang)];

/** Resolve "a.b.c" against a locale object.
 *  Tries strict nested lookup first, then progressively treats the trailing
 *  segments as a single literal key. This lets us keep flat field-error keys
 *  (e.g. validation['email.invalid']) while still calling t('validation.email.invalid'). */
const resolve = (obj, key) => {
  const parts = key.split('.');
  // 1) strict nested
  const strict = parts.reduce(
    (acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined),
    obj
  );
  if (strict !== undefined) return strict;
  // 2) progressive split: { a.b.c, a.b + c, a + b.c }
  for (let i = 1; i < parts.length; i++) {
    const head = parts.slice(0, i);
    const tail = parts.slice(i).join('.');
    const node = head.reduce(
      (acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined),
      obj
    );
    if (node && typeof node === 'object' && node[tail] !== undefined) {
      return node[tail];
    }
  }
  return undefined;
};

const t = (lang, key) => {
  const code = normalizeLang(lang);
  const v = resolve(LOCALES[code], key);
  if (v !== undefined) return v;
  const fallback = resolve(LOCALES[DEFAULT_LANG], key);
  return fallback !== undefined ? fallback : key;
};

/** Localized service label (handles unknown service codes gracefully). */
const serviceLabel = (lang, key) => {
  const code = normalizeLang(lang);
  return (
    (LOCALES[code].services && LOCALES[code].services[key]) ||
    LOCALES[DEFAULT_LANG].services[key] ||
    key
  );
};

module.exports = {
  t,
  getLocale,
  serviceLabel,
  normalizeLang,
  SUPPORTED,
  DEFAULT_LANG,
};
