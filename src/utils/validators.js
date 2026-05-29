'use strict';

/**
 * Input validation rules — uses TRANSLATION KEYS instead of hard-coded strings.
 * The controller's error formatter resolves these keys against the client's
 * chosen language, so the frontend always receives localized error messages.
 */

const { body } = require('express-validator');
const { SUPPORTED } = require('../locales');

const SUPPORTED_SERVICES = [
  'website',
  'social',
  'branding',
  'full',
  'chat',
  'other',
];

const contactValidationRules = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('fullName.required')
    .isLength({ min: 2, max: 100 }).withMessage('fullName.length'),

  body('email')
    .trim()
    .notEmpty().withMessage('email.required')
    .isEmail().withMessage('email.invalid')
    .normalizeEmail()
    .isLength({ max: 160 }).withMessage('email.invalid'),

  body('phone')
    .trim()
    .notEmpty().withMessage('phone.required')
    .matches(/^\+?[0-9\s\-().]{6,25}$/).withMessage('phone.invalid'),

  body('company')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 120 }).withMessage('company.length'),

  body('service')
    .trim()
    .notEmpty().withMessage('service.required')
    .toLowerCase()
    .isIn(SUPPORTED_SERVICES).withMessage('service.invalid'),

  body('message')
    .trim()
    .notEmpty().withMessage('message.required')
    .isLength({ min: 5, max: 4000 }).withMessage('message.length'),

  body('language')
    .optional({ checkFalsy: true })
    .trim()
    .toLowerCase()
    .isIn(SUPPORTED).withMessage('language.invalid'),
];

module.exports = {
  contactValidationRules,
  SUPPORTED_LANGS: SUPPORTED,
  SUPPORTED_SERVICES,
};
