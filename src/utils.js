import CONFIG from './config.js';

/**
 * Logger utility with timestamp support
 */
export class Logger {
  constructor(verbose = CONFIG.logging.verbose) {
    this.verbose = verbose;
  }

  _timestamp() {
    if (!CONFIG.logging.logTimestamps) return '';
    const now = new Date().toISOString();
    return `[${now}] `;
  }

  info(message) {
    console.log(`${this._timestamp()}ℹ️  ${message}`);
  }

  success(message) {
    console.log(`${this._timestamp()}✅ ${message}`);
  }

  warning(message) {
    console.warn(`${this._timestamp()}⚠️  ${message}`);
  }

  error(message) {
    console.error(`${this._timestamp()}❌ ${message}`);
  }

  debug(message) {
    if (this.verbose) {
      console.log(`${this._timestamp()}🔍 ${message}`);
    }
  }

  section(title) {
    console.log(`\n${this._timestamp()}━━━ ${title} ━━━`);
  }
}

/**
 * Generate random delay between min and max milliseconds
 */
export function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Sleep for specified milliseconds
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simulate human-like random delay between actions
 */
export async function humanDelay(minMs = CONFIG.timing.actionDelayMin, maxMs = CONFIG.timing.actionDelayMax) {
  const delay = getRandomDelay(minMs, maxMs);
  await sleep(delay);
}

/**
 * Remove duplicates from array of objects by key
 */
export function removeDuplicates(items, key = 'name') {
  const seen = new Set();
  return items.filter((item) => {
    const keyValue = (item[key] || '').toLowerCase().trim();
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
}

/**
 * Sanitize text: trim, remove extra whitespace, handle nulls
 */
export function sanitizeText(text) {
  if (!text) return null;
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Get timestamp for file naming
 */
export function getTimestamp() {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').split('-').slice(0, 4).join('-') + now.getHours() + now.getMinutes();
}

export default {
  Logger,
  getRandomDelay,
  sleep,
  humanDelay,
  removeDuplicates,
  sanitizeText,
  getTimestamp,
};
