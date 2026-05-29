'use strict';

/**
 * English locale.
 * Add a new language by copying this file and translating values.
 * Keys must stay identical across locales.
 */

module.exports = {
  code: 'en',
  dir: 'ltr',
  dateLocale: 'en-US',

  services: {
    website: 'Website Design',
    social: 'Social Media Management',
    branding: 'Branding & Identity',
    full: 'Full Growth Package',
    chat: 'Just want to chat',
    other: 'Other',
  },

  // Messages returned to the frontend
  api: {
    success:
      'Thank you for contacting Zenova Agency. We received your request and our team will contact you soon.',
    serverError:
      'Something went wrong on our side. Please try again in a moment or contact us directly.',
    validationError: 'Please check your inputs and try again.',
    rateLimit: 'Too many requests. Please try again later.',
  },

  // Field-level validation messages
  validation: {
    'fullName.required': 'Please enter your full name.',
    'fullName.length': 'Full name must be between 2 and 100 characters.',
    'email.required': 'Please enter your email address.',
    'email.invalid': 'Please enter a valid email address.',
    'phone.required': 'Please enter your phone number.',
    'phone.invalid': 'Please enter a valid phone number.',
    'company.length': 'Company name is too long.',
    'service.required': 'Please select a service.',
    'service.invalid': 'Please select a valid service.',
    'message.required': 'Please write a short message.',
    'message.length': 'Message must be between 5 and 4000 characters.',
    'language.invalid': 'Unsupported language.',
  },

  // Client confirmation email
  confirmation: {
    subject: 'Thank you for contacting Zenova Agency',
    title: 'Thank you for reaching out!',
    body: 'Thank you for contacting Zenova Agency. We received your request and our team will contact you soon.',
    summary: 'Here is a copy of what you sent us:',
    closing: 'Talk soon,',
    team: 'The Zenova Team',
    labels: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      service: 'Service',
      message: 'Message',
    },
  },

  // Internal admin notification email (always rendered in EN regardless of client language)
  notification: {
    subjectPrefix: 'New Lead',
    headline: 'NEW WEBSITE LEAD',
    sectionMessage: 'Message',
    labels: {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      company: 'Company',
      service: 'Service',
      language: 'Language',
      submitted: 'Submitted',
    },
    footer: 'Zenova Agency — automated lead notification',
  },
};
