'use strict';

/**
 * Express app composition. Kept separate from server.js so this module
 * can be imported by tests without binding a port.
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const hpp = require('hpp');

const config = require('./config/env');
const logger = require('./utils/logger');
const sanitize = require('./middleware/sanitize');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Trust the first proxy hop (Render/Railway/Fly/Netlify Functions terminate TLS)
// — required for correct req.ip + rate-limiting behind a proxy.
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // we don't serve HTML; the frontend has its own CSP
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — explicit allow-list from CORS_ORIGINS env
const corsOptions = {
  origin: (origin, cb) => {
    // Allow same-origin / curl / server-to-server (no Origin header)
    if (!origin) return cb(null, true);
    if (
      config.cors.origins.length === 0 ||
      config.cors.origins.includes(origin)
    ) {
      return cb(null, true);
    }
    logger.warn('CORS blocked origin:', origin);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false,
  maxAge: 86400,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing — small limit; this is a contact form, not an upload service
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

// Anti-pollution + sanitization
app.use(hpp());
app.use(sanitize);

// Logging (skip in test)
if (config.env !== 'test') {
  app.use(
    morgan(config.isProd ? 'combined' : 'dev', {
      stream: { write: (m) => logger.info(m.trim()) },
    })
  );
}

// Compression
app.use(compression());

// Routes
app.use('/api', contactRoutes);

// Root info — handy when you open the API URL in a browser
app.get('/', (_req, res) => {
  res.json({
    service: 'Zenova Agency Backend',
    status: 'ok',
    endpoints: ['POST /api/contact', 'GET /api/health'],
  });
});

// 404 + error handler must be LAST
app.use(notFound);
app.use(errorHandler);

module.exports = app;
