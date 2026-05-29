'use strict';

/**
 * Lightweight JSON-file storage for form submissions.
 * Each submission is appended as a single line (JSON Lines / NDJSON) so
 * concurrent writes don't corrupt earlier entries. Easy to swap for a
 * real database later — keep this interface (saveSubmission) stable.
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

const DATA_DIR = path.resolve(__dirname, '../../data');
const FILE = path.join(DATA_DIR, 'submissions.jsonl');

const ensureDir = async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

const saveSubmission = async (data) => {
  const record = {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    ...data,
  };
  try {
    await ensureDir();
    await fs.appendFile(FILE, JSON.stringify(record) + '\n', 'utf8');
    return record;
  } catch (err) {
    logger.error('Failed to persist submission:', err.message);
    // Don't block the user response on storage failure.
    return record;
  }
};

module.exports = { saveSubmission };
