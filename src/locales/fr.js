'use strict';

/** French locale — keys must stay in sync with en.js */

module.exports = {
  code: 'fr',
  dir: 'ltr',
  dateLocale: 'fr-FR',

  services: {
    website: 'Création de site web',
    social: 'Gestion des réseaux sociaux',
    branding: 'Branding & Identité',
    full: 'Pack croissance complet',
    chat: 'Juste discuter',
    other: 'Autre',
  },

  api: {
    success:
      'Merci d’avoir contacté Zenova Agency. Nous avons bien reçu votre demande et notre équipe vous contactera bientôt.',
    serverError:
      'Une erreur est survenue de notre côté. Veuillez réessayer dans un instant ou nous contacter directement.',
    validationError: 'Veuillez vérifier vos informations et réessayer.',
    rateLimit: 'Trop de tentatives. Veuillez réessayer plus tard.',
  },

  validation: {
    'fullName.required': 'Veuillez saisir votre nom complet.',
    'fullName.length': 'Le nom doit contenir entre 2 et 100 caractères.',
    'email.required': 'Veuillez saisir votre adresse e-mail.',
    'email.invalid': 'Veuillez saisir une adresse e-mail valide.',
    'phone.required': 'Veuillez saisir votre numéro de téléphone.',
    'phone.invalid': 'Veuillez saisir un numéro de téléphone valide.',
    'company.length': 'Le nom de l’entreprise est trop long.',
    'service.required': 'Veuillez sélectionner un service.',
    'service.invalid': 'Veuillez sélectionner un service valide.',
    'message.required': 'Veuillez écrire un court message.',
    'message.length': 'Le message doit contenir entre 5 et 4000 caractères.',
    'language.invalid': 'Langue non prise en charge.',
  },

  confirmation: {
    subject: 'Merci d’avoir contacté Zenova Agency',
    title: 'Merci pour votre message !',
    body: 'Merci d’avoir contacté Zenova Agency. Nous avons bien reçu votre demande et notre équipe vous contactera bientôt.',
    summary: 'Voici un récapitulatif de votre demande :',
    closing: 'À très vite,',
    team: 'L’équipe Zenova',
    labels: {
      name: 'Nom',
      email: 'E-mail',
      phone: 'Téléphone',
      company: 'Entreprise',
      service: 'Service',
      message: 'Message',
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
