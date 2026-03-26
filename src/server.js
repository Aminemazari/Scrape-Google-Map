/**
 * Google Maps Scraper API Server
 * 
 * Copyright © 2026 Lacos
 * Licensed under MIT License - See LICENSE file for details
 * 
 * Express REST API server for scraping Google Maps listings
 */

import express from 'express';
import { GoogleMapsScraper } from './scraper.js';
import { Logger } from './utils.js';

const logger = new Logger();
const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || 'your-secret-api-key-change-me';

// Middleware
app.use(express.json());

/**
 * API Key validation middleware
 */
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'Missing API key',
      message: 'Provide API key via "x-api-key" header or "api_key" query parameter'
    });
  }

  if (apiKey !== API_KEY) {
    return res.status(403).json({
      error: 'Invalid API key',
      message: 'The provided API key is incorrect'
    });
  }

  next();
}

/**
 * POST /scrape - Scrape Google Maps listings
 * Body: { query: "search query" }
 * Headers: x-api-key: your-api-key
 */
app.post('/scrape', validateApiKey, async (req, res) => {
  try {
    const { query } = req.body;

    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid query',
        message: 'Please provide a valid search query in the request body'
      });
    }

    logger.section(`API REQUEST: Scraping "${query}"`);

    // Initialize scraper
    const scraper = new GoogleMapsScraper();

    try {
      // Initialize browser
      await scraper.initialize();

      // Run scraping
      const listings = await scraper.scrapeAll(query);

      // Close browser
      await scraper.close();

      // Return results
      return res.status(200).json({
        success: true,
        query: query,
        totalListings: listings.length,
        data: listings,
        timestamp: new Date().toISOString()
      });
    } catch (scrapeError) {
      logger.error(`Scraping error: ${scrapeError.message}`);
      
      // Ensure browser is closed on error
      try {
        await scraper.close();
      } catch (e) {
        // Ignore close errors
      }

      return res.status(500).json({
        error: 'Scraping failed',
        message: scrapeError.message,
        query: query
      });
    }
  } catch (error) {
    logger.error(`API error: ${error.message}`);
    return res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

/**
 * GET /health - Health check
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /docs - API documentation
 */
app.get('/docs', (req, res) => {
  res.status(200).json({
    title: 'Google Maps Scraper API',
    version: '1.0.0',
    endpoints: [
      {
        method: 'POST',
        path: '/scrape',
        description: 'Scrape Google Maps listings for a given search query',
        authentication: 'x-api-key header (required)',
        requestBody: {
          query: 'string (search query, required)'
        },
        example: {
          method: 'POST',
          url: 'http://localhost:3000/scrape',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'your-api-key'
          },
          body: {
            query: 'real estate new york'
          }
        },
        response: {
          success: 'boolean',
          query: 'string',
          totalListings: 'number',
          data: 'array of listings',
          timestamp: 'ISO timestamp'
        }
      },
      {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint',
        authentication: 'none'
      },
      {
        method: 'GET',
        path: '/docs',
        description: 'API documentation',
        authentication: 'none'
      }
    ],
    authentication: {
      type: 'API Key',
      headerName: 'x-api-key',
      description: 'Pass your API key in the "x-api-key" header or as "api_key" query parameter'
    },
    environment: {
      API_KEY: 'Set via API_KEY environment variable (default: your-secret-api-key-change-me)',
      PORT: 'Set via PORT environment variable (default: 3000)'
    }
  });
});

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: ['/scrape (POST)', '/health (GET)', '/docs (GET)']
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  logger.section('SERVER STARTED');
  logger.info(`Server running on: http://localhost:${PORT}`);
  logger.info(`API Key: ${API_KEY}`);
  logger.info(`Documentation: http://localhost:${PORT}/docs`);
  logger.info(`Health check: http://localhost:${PORT}/health`);
  logger.info('');
  logger.info('Example API request:');
  logger.info('```bash');
  logger.info(`curl -X POST http://localhost:${PORT}/scrape \\`);
  logger.info(`  -H "Content-Type: application/json" \\`);
  logger.info(`  -H "x-api-key: ${API_KEY}" \\`);
  logger.info(`  -d '{"query": "real estate new york"}'`);
  logger.info('```');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
