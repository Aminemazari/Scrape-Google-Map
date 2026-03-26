/**
 * Configuration and constants for Google Maps scraper
 * Modify these values to customize behavior
 */

export const CONFIG = {
  // Browser settings
  browser: {
    headless: false, // Run in headful mode (visible browser)
    slowMo: 100, // Slow down animations (ms)
    timeout: 60000, // 60 seconds timeout for navigation (Google Maps can be slow)
  },

  // Pacing and delays (in milliseconds)
  timing: {
    // Random delay between actions
    actionDelayMin: 2000, // 2 seconds
    actionDelayMax: 5000, // 5 seconds

    // Delay between scroll actions
    scrollDelayMin: 1500,
    scrollDelayMax: 3500,

    // Wait for elements to load
    elementWaitTimeout: 10000,

    // Initial wait after search
    searchLoadDelay: 3000,
  },

  // Data collection limits
  limits: {
    maxResults: 60, // Maximum listings to collect
    maxScrolls: 15, // Maximum scroll actions before stopping
    maxRuntimeMinutes: 10, // Stop after 10 minutes
  },

  // Selectors for Google Maps UI
  selectors: {
    // Search input - Find input with role="combobox" inside the form
    searchInput: 'input[role="combobox"], input#ucc-1, input[name="q"], [aria-label="Search on Google Maps"]',

    // Results panel - The scrollable list of results on the left
    resultsPanel:
      '[role="main"], .section-results-container, [data-item-id]',

    // Individual result items - Links with class hfpxzc (business cards in results list)
    resultItem: 'a.hfpxzc, [role="option"], [data-item-id], .business-card',

    // Business name - h1 with class DUwDvf in the detail panel
    businessName: 'h1.DUwDvf, h1, h2, [class*="heading"]',

    // Rating - span with aria-label containing "stars" or similar
    rating: '[aria-label*="star"], [aria-label*="étoile"], .rating, span[role="img"]',

    // Address - Usually in a button with data-item-id="address"
    address:
      '[data-item-id="address"], [aria-label*="address"], [aria-label*="Adresse"], .address',

    // Website link - typically an anchor tag with href
    website: 'a[href*="http"], a[href*="www"], [data-item-id*="action"], [aria-label*="site"]',
  },

  // Output settings
  output: {
    dirPath: './results',
    jsonFileName: 'google_maps_listings.json',
    csvFileName: 'google_maps_listings.csv',
  },

  // Google Maps URL
  mapsUrl: 'https://www.google.com/maps',

  // User-agent to appear more like a regular user
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

  // Logging
  logging: {
    verbose: true,
    logTimestamps: true,
  },
};

export default CONFIG;
