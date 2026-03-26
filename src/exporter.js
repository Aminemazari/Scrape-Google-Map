import fs from 'fs';
import path from 'path';
import { Logger, getTimestamp } from './utils.js';
import CONFIG from './config.js';

const logger = new Logger();

/**
 * Ensures output directory exists
 */
function ensureOutputDir() {
  if (!fs.existsSync(CONFIG.output.dirPath)) {
    fs.mkdirSync(CONFIG.output.dirPath, { recursive: true });
    logger.info(`Created output directory: ${CONFIG.output.dirPath}`);
  }
}

/**
 * Saves listings to JSON file
 */
export function saveToJSON(listings, query) {
  try {
    ensureOutputDir();

    const timestamp = getTimestamp();
    const fileName = `${timestamp}_${CONFIG.output.jsonFileName}`;
    const filePath = path.join(CONFIG.output.dirPath, fileName);

    const data = {
      metadata: {
        query,
        timestamp: new Date().toISOString(),
        totalResults: listings.length,
      },
      listings,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    logger.success(`Saved ${listings.length} listings to: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`Failed to save JSON: ${error.message}`);
    throw error;
  }
}

/**
 * Converts listings to CSV format
 */
function listingsToCSV(listings) {
  if (listings.length === 0) {
    return '';
  }

  // Get all unique keys
  const allKeys = new Set();
  listings.forEach((listing) => {
    Object.keys(listing).forEach((key) => allKeys.add(key));
  });

  const headers = Array.from(allKeys);
  const rows = listings.map((listing) =>
    headers.map((header) => {
      const value = listing[header] || '';
      // Escape quotes by doubling them, then wrap in quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(',')
  );

  return [headers.map((h) => `"${h}"`).join(','), ...rows].join('\n');
}

/**
 * Saves listings to CSV file
 */
export function saveToCSV(listings, query) {
  try {
    ensureOutputDir();

    const timestamp = getTimestamp();
    const fileName = `${timestamp}_${CONFIG.output.csvFileName}`;
    const filePath = path.join(CONFIG.output.dirPath, fileName);

    const csv = listingsToCSV(listings);
    fs.writeFileSync(filePath, csv, 'utf-8');
    logger.success(`Saved ${listings.length} listings to: ${filePath}`);
    return filePath;
  } catch (error) {
    logger.error(`Failed to save CSV: ${error.message}`);
    throw error;
  }
}

/**
 * Saves results in both JSON and CSV formats
 */
export async function saveResults(listings, query) {
  logger.section('SAVING RESULTS');

  try {
    if (listings.length === 0) {
      logger.warning('No listings to save');
      return { jsonFile: null, csvFile: null };
    }

    const jsonFile = saveToJSON(listings, query);
    const csvFile = saveToCSV(listings, query);

    logger.info(`\nTotal listings collected: ${listings.length}`);
    logger.info(`Query: "${query}"`);
    logger.info(`Saved to results directory: ${CONFIG.output.dirPath}`);

    return { jsonFile, csvFile };
  } catch (error) {
    logger.error(`Failed to save results: ${error.message}`);
    throw error;
  }
}

export default {
  saveToJSON,
  saveToCSV,
  saveResults,
  ensureOutputDir,
};
