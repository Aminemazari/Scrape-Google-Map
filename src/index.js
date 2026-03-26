#!/usr/bin/env node

/**
 * Google Maps Scraper CLI
 * 
 * Copyright © 2026 Lacos
 * Licensed under MIT License - See LICENSE file for details
 * 
 * Command-line interface for scraping Google Maps listings
 */

import GoogleMapsScraper from './scraper.js';
import { saveResults } from './exporter.js';
import { Logger } from './utils.js';
import CONFIG from './config.js';

const logger = new Logger();

/**
 * Parse command-line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);

  // Default values
  let query = 'restaurants near me';
  let maxResults = CONFIG.limits.maxResults;

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i].toLowerCase();

    if (arg === '--query' || arg === '-q') {
      query = args[i + 1];
      i++;
    } else if (arg === '--max-results' || arg === '-m') {
      maxResults = parseInt(args[i + 1], 10);
      i++;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      // First non-flag argument is the query
      query = arg;
    }
  }

  // Validate
  if (isNaN(maxResults) || maxResults < 1) {
    maxResults = CONFIG.limits.maxResults;
  } else if (maxResults > CONFIG.limits.maxResults) {
    logger.warning(`Max results capped at ${CONFIG.limits.maxResults}`);
    maxResults = CONFIG.limits.maxResults;
  }

  return { query, maxResults };
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║         Google Maps Business Listings Scraper              ║
║  Stable, low-volume, human-like data collection tool       ║
╚════════════════════════════════════════════════════════════╝

USAGE:
  npm start                                    # Use default query
  npm start -- "restaurants in Barcelona"     # Custom query
  node src/index.js --query "coffee shops"    # With flags
  node src/index.js -q "hotels" -m 80         # Short flags

OPTIONS:
  -q, --query <text>       Search query (default: "restaurants near me")
  -m, --max-results <num>  Maximum results (default: ${CONFIG.limits.maxResults}, max: ${CONFIG.limits.maxResults})
  -h, --help              Show this help message

EXAMPLES:
  npm start -- "coffee shops in Paris"
  npm start -- --query "hospitals" --max-results 50
  node src/index.js -q "gyms" -m 100

FEATURES:
  ✓ Headful mode (visible browser window)
  ✓ Human-like delays (2-5 seconds between actions)
  ✓ Gradual scrolling (no aggressive automation)
  ✓ Safe limits (max ${CONFIG.limits.maxResults} results, ${CONFIG.limits.maxRuntimeMinutes} min timeout)
  ✓ Duplicate detection
  ✓ JSON + CSV output
  ✓ CAPTCHA detection with abort

RESULTS:
  Results saved to: ${CONFIG.output.dirPath}/
  Formats: JSON and CSV with timestamps

CONFIGURATION:
  Edit src/config.js to modify:
  - Delays and pacing
  - Result limits
  - Timeout values
  - Output paths
  `);
}

/**
 * Print banner
 */
function printBanner() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║      Google Maps Business Listings Scraper v1.0.0          ║
║        Human-like pacing • Stable • Low-volume             ║
╚════════════════════════════════════════════════════════════╝
  `);
}

/**
 * Main function
 */
async function main() {
  printBanner();

  const { query, maxResults } = parseArguments();

  logger.section('CONFIGURATION');
  logger.info(`Query: "${query}"`);
  logger.info(`Max results: ${maxResults}`);
  logger.info(`Max scrolls: ${CONFIG.limits.maxScrolls}`);
  logger.info(`Max runtime: ${CONFIG.limits.maxRuntimeMinutes} minutes`);
  logger.info(`Action delay: ${CONFIG.timing.actionDelayMin}-${CONFIG.timing.actionDelayMax}ms`);

  let scraper = null;

  try {
    // Initialize scraper
    scraper = new GoogleMapsScraper();
    await scraper.initialize();

    // Override max results config for this session
    const originalMax = CONFIG.limits.maxResults;
    CONFIG.limits.maxResults = maxResults;

    // Run scraping
    await scraper.scrapeAll(query);

    // Restore original config
    CONFIG.limits.maxResults = originalMax;

    // Print summary
    scraper.printSummary();

    // Save results
    if (scraper.listings.length > 0) {
      await saveResults(scraper.listings, query);
    } else {
      logger.warning('No listings were collected');
    }

    logger.success('\n✨ Scraping completed successfully\n');
  } catch (error) {
    logger.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    // Clean up
    if (scraper) {
      await scraper.close();
    }
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled promise rejection: ${reason}`);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

// Run main function
main().catch((error) => {
  logger.error(`Main function error: ${error.message}`);
  process.exit(1);
});
