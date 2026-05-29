'use strict';

/** Arabic locale (RTL) — keys must stay in sync with en.js */

module.exports = {
  code: 'ar',
  dir: 'rtl',
  dateLocale: 'ar-MA',

  services: {
    website: 'تصميم موقع ويب',
    social: 'إدارة وسائل التواصل الاجتماعي',
    branding: 'الهوية البصرية والعلامة التجارية',
    full: 'باقة النمو الكاملة',
    chat: 'مجرد دردشة',
    other: 'أخرى',
  },

  api: {
    success:
      'شكراً لتواصلك مع Zenova Agency. لقد توصلنا بطلبك وسيتم التواصل معك قريباً.',
    serverError:
      'حدث خطأ من جهتنا. يرجى المحاولة مرة أخرى بعد قليل أو التواصل معنا مباشرة.',
    validationError: 'يرجى التحقق من المعلومات والمحاولة مرة أخرى.',
    rateLimit: 'عدد كبير من الطلبات. يرجى المحاولة لاحقاً.',
  },

  validation: {
    'fullName.required': 'يرجى إدخال اسمك الكامل.',
    'fullName.length': 'يجب أن يتراوح الاسم بين 2 و 100 حرف.',
    'email.required': 'يرجى إدخال بريدك الإلكتروني.',
    'email.invalid': 'يرجى إدخال بريد إلكتروني صالح.',
    'phone.required': 'يرجى إدخال رقم هاتفك.',
    'phone.invalid': 'يرجى إدخال رقم هاتف صالح.',
    'company.length': 'اسم الشركة طويل جداً.',
    'service.required': 'يرجى اختيار خدمة.',
    'service.invalid': 'يرجى اختيار خدمة صالحة.',
    'message.required': 'يرجى كتابة رسالة قصيرة.',
    'message.length': 'يجب أن تتراوح الرسالة بين 5 و 4000 حرف.',
    'language.invalid': 'اللغة غير مدعومة.',
  },

  confirmation: {
    subject: 'شكراً لتواصلك مع Zenova Agency',
    title: 'شكراً على تواصلك معنا!',
    body: 'شكراً لتواصلك مع Zenova Agency. لقد توصلنا بطلبك وسيتم التواصل معك قريباً.',
    summary: 'هذه نسخة من المعلومات التي أرسلتها لنا:',
    closing: 'إلى اللقاء قريباً،',
    team: 'فريق Zenova',
    labels: {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      phone: 'الهاتف',
      company: 'الشركة',
      service: 'الخدمة',
      message: 'الرسالة',
    },
  },

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
