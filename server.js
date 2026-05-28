'use strict';

/**
 * HTTP entry point. Loads env via app.js → config, starts the listener,
 * verifies SMTP, and wires graceful shutdown.
 */

const app = require('./src/app');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const emailService = require('./src/services/emailService');

const server = app.listen(config.port, () => {
  logger.info(
    `Zenova backend listening on http://localhost:${config.port} (${config.env})`
  );
  // Best-effort SMTP verification — never blocks startup.
  emailService.verify();
});

const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down…`);
  server.close((err) => {
    if (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
    logger.info('HTTP server closed');
    process.exit(0);
  });
  // Force-exit if shutdown hangs > 10s
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
  shutdown('uncaughtException');
});
