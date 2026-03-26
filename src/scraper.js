/**
 * Google Maps Scraper
 * 
 * Copyright © 2026 Lacos
 * Licensed under MIT License - See LICENSE file for details
 * 
 * This module provides the core Google Maps scraping functionality
 * using Playwright for browser automation.
 */

import { chromium } from 'playwright';
import { Logger, humanDelay, sleep, sanitizeText, removeDuplicates, getRandomDelay } from './utils.js';
import CONFIG from './config.js';

const logger = new Logger();

/**
 * Main scraper class for Google Maps
 */
export class GoogleMapsScraper {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.listings = [];
    this.startTime = null;
    this.scrollCount = 0;
    this.processedCardIndices = new Set(); // Track which cards have been processed
  }

  /**
   * Initialize browser and create new context
   */
  async initialize() {
    try {
      logger.section('INITIALIZING BROWSER');

      this.browser = await chromium.launch({
        headless: CONFIG.browser.headless,
        slowMo: CONFIG.browser.slowMo,
      });

      this.context = await this.browser.newContext({
        userAgent: CONFIG.userAgent,
        viewport: { width: 1280, height: 720 },
      });

      this.page = await this.context.newPage();
      this.startTime = Date.now();

      logger.success('Browser initialized in headful mode');
      return true;
    } catch (error) {
      logger.error(`Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Navigate to Google Maps and perform search
   */
  async search(query) {
    try {
      logger.section('SEARCHING GOOGLE MAPS');
      logger.info(`Query: "${query}"`);

      // Navigate to Google Maps
      logger.info('Loading Google Maps...');
      await this.page.goto(CONFIG.mapsUrl, {
        waitUntil: 'domcontentloaded',
        timeout: CONFIG.browser.timeout,
      });
      
      // Give page time to settle
      await sleep(2000);

      await humanDelay(1500, 2500);

      // Find and click on search input
      logger.info('Looking for search input...');
      const searchInput = await this.page.$(CONFIG.selectors.searchInput);
      
      if (!searchInput) {
        logger.error('Could not find search input with selectors:', CONFIG.selectors.searchInput);
        // Try to find any visible input
        const anyInput = await this.page.$('input[type="text"], input[role="combobox"]');
        if (!anyInput) {
          logger.error('No text input found on page');
          return false;
        }
      }

      // Focus and clear the input first
      await this.page.focus(CONFIG.selectors.searchInput);
      await this.page.evaluate(() => {
        const input = document.querySelector('input[role="combobox"]');
        if (input) input.value = '';
      });

      await humanDelay(500, 1000);

      // Type the query
      logger.info(`Typing query: "${query}"`);
      await this.page.type(CONFIG.selectors.searchInput, query, { delay: 50 });

      await humanDelay(1000, 2000);

      // Press Enter to search
      logger.info('Submitting search with Enter...');
      await this.page.press(CONFIG.selectors.searchInput, 'Enter');

      // Wait for results to load
      logger.info('Waiting for results to load...');
      await sleep(CONFIG.timing.searchLoadDelay);

      // Wait for result items to appear (the business cards)
      try {
        await this.page.waitForSelector('a.hfpxzc, [data-item-id]', {
          timeout: CONFIG.timing.elementWaitTimeout,
        });
        logger.success('Search results loaded');
      } catch (error) {
        logger.warning('Result items not found immediately, continuing anyway...');
      }

      await humanDelay();
      logger.success('Search completed');

      return true;
    } catch (error) {
      logger.error(`Search failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if the "end of list" message is visible
   */
  async isEndOfListReached() {
    try {
      const endOfListElement = await this.page.evaluate(() => {
        const element = document.querySelector('span.HlvSq');
        if (element && element.textContent.includes("You've reached the end of the list")) {
          return true;
        }
        return false;
      });

      if (endOfListElement) {
        logger.success("✓ Reached the end of the list - all cards processed");
        return true;
      }

      return false;
    } catch (error) {
      logger.debug(`Error checking for end of list: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if page is blocked (e.g., CAPTCHA)
   */
  async isPageBlocked() {
    try {
      // Check for common block indicators
      const blockedSelectors = [
        'text=Please confirm you\'re not a robot',
        'text=About this result',
        'iframe[src*="recaptcha"]',
        '[data-page-state="CAPTCHA"]',
      ];

      for (const selector of blockedSelectors) {
        const element = await this.page.$(selector).catch(() => null);
        if (element) {
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Scroll the Google Maps results panel gradually and naturally
   * Scrolls the specific container (NOT window), waits for cards to load
   */
  async scrollResults() {
    try {
      // Check if blocked
      if (await this.isPageBlocked()) {
        logger.error('Page appears to be blocked (CAPTCHA detected)');
        return false;
      }

      // Get initial results count
      const initialCount = await this.page.$$eval('a.hfpxzc', (els) => els.length);
      logger.debug(`Initial cards: ${initialCount}`);

      // Find and scroll the correct container
      const scrolled = await this.page.evaluate(() => {
        // Try multiple selectors for the results feed container
        let container = document.querySelector('div[role="feed"]');  // Google Maps feed role
        
        if (!container) {
          container = document.querySelector('div.m6QErb.kA9KIf');   // Results panel with specific classes
        }
        
        if (!container) {
          container = document.querySelector('div.kA9KIf');         // Scrollable results panel
        }

        if (!container) {
          return { success: false, error: 'Container not found' };
        }

        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        const currentScroll = container.scrollTop;

        // Check if we can scroll
        if (scrollHeight <= clientHeight) {
          return { success: false, error: 'Container not scrollable (height <= clientHeight)' };
        }

        // Scroll gradually (200-400px increments like natural scrolling)
        const scrollAmount = Math.floor(Math.random() * 200) + 200; // 200-400px
        container.scrollTop += scrollAmount;

        return {
          success: true,
          scrollAmount: scrollAmount,
          newScrollTop: container.scrollTop,
          scrollHeight: scrollHeight,
          canScrollMore: container.scrollTop + clientHeight < scrollHeight - 100
        };
      });

      if (!scrolled.success) {
        logger.warning(`Scroll failed: ${scrolled.error}`);
        return false;
      }

      logger.info(`Scrolled ${scrolled.scrollAmount}px → Position: ${scrolled.newScrollTop}px (can scroll more: ${scrolled.canScrollMore})`);

      // Wait for lazy-loaded cards to appear (800-1500ms delay)
      const delay = Math.floor(Math.random() * 700) + 800;
      logger.debug(`Waiting ${delay}ms for cards to load...`);
      await sleep(delay);

      // Check if new cards loaded
      const finalCount = await this.page.$$eval('a.hfpxzc', (els) => els.length);
      
      if (finalCount > initialCount) {
        logger.success(`✓ ${finalCount - initialCount} new cards loaded! (Total: ${finalCount})`);
        this.scrollCount++;
        return true;
      }

      logger.debug(`No new cards detected after scroll (still ${initialCount} cards)`);
      this.scrollCount++;
      return true; // Still count the scroll attempt
    } catch (error) {
      logger.error(`Scroll error: ${error.message}`);
      return false;
    }
  }

  /**
   * Extract website URL and phone number from detail panel
   * @param {string} businessName - Name of the business to identify it
   * @returns {Promise<Object>} - Object with website and phone properties
   */
  async extractWebsiteAndPhoneFromDetailPanel(businessName) {
    try {
      logger.debug(`Extracting website and phone for: ${businessName}`);

      // Wait for detail panel to render
      await sleep(800);

      // Extract both website and phone from the detail panel
      const detailData = await this.page.evaluate(() => {
        let website = null;
        let phone = null;

        // Extract website URL
        const allLcr4Links = Array.from(document.querySelectorAll('a.lcr4fd'));
        for (const link of allLcr4Links.reverse()) {
          const href = link.getAttribute('href') || '';
          const ariaLabel = (link.getAttribute('aria-label') || '').toLowerCase();
          
          // Check if it's a website link
          const isWebsiteLink = ariaLabel.includes('site') || ariaLabel.includes('web') || 
                               ariaLabel.includes('visite') || ariaLabel.includes('besuchen') ||
                               ariaLabel.includes('访问') || ariaLabel.includes('посетить');
          
          if (!isWebsiteLink) continue;
          
          // Skip Google domains and tracking
          if (href.includes('google.com') || href.startsWith('/')) {
            continue;
          }
          
          // Valid http URLs
          if (href.startsWith('http://') || href.startsWith('https://')) {
            website = href;
            break;
          }
        }

        // Extract phone number - look for text that is ONLY a phone number
        // Phone numbers typically have: +, digits, spaces, dashes, parentheses
        const allDivs = Array.from(document.querySelectorAll('div.Io6YTe'));
        for (const div of allDivs) {
          const text = (div.textContent || '').trim();
          
          // Check if this looks like a phone number
          // Phone pattern: contains +, has mostly digits/formatting, short enough to be just a phone
          const hasPlus = text.includes('+');
          const digitCount = (text.match(/\d/g) || []).length;
          const isShort = text.length < 30; // Phone numbers are typically short
          
          // If it has +, has at least 8 digits, and is short, it's probably a phone number
          if (hasPlus && digitCount >= 8 && isShort) {
            phone = text;
            break;
          }
        }

        return { website, phone };
      }).catch(() => ({ website: null, phone: null }));

      if (detailData.website) {
        logger.debug(`Found website for ${businessName}: ${detailData.website}`);
      }
      if (detailData.phone) {
        logger.debug(`Found phone for ${businessName}: ${detailData.phone}`);
      }

      return detailData;
    } catch (error) {
      logger.debug(`Detail extraction error for ${businessName}: ${error.message}`);
      return { website: null, phone: null };
    }
  }

  /**
   * Click on a listing card to open detail panel and extract all data
   * @param {number} index - Index of the card to click
   * @param {Object} basicInfo - Basic info extracted from search results
   * @returns {Promise<Object>} - Complete listing with website info
   */
  async clickAndExtractDetail(index, basicInfo) {
    try {
      logger.debug(`Processing card ${index + 1}: ${basicInfo.name}`);

      // Get all result items
      const resultItems = await this.page.$$('a.hfpxzc');

      if (index >= resultItems.length) {
        logger.warning(`Card index ${index} out of bounds`);
        return basicInfo;
      }

      // Click the card at the specified index
      const card = resultItems[index];
      
      // Scroll card into view if needed
      await card.scrollIntoViewIfNeeded().catch(() => {});

      // Click with short delay
      await sleep(200);
      await card.click().catch((err) => {
        logger.debug(`Click failed: ${err.message}`);
      });

      // Wait for detail panel to load
      await sleep(1200);

      // Extract website and phone from detail panel
      const { website, phone } = await this.extractWebsiteAndPhoneFromDetailPanel(basicInfo.name);

      // Add website and phone to listing
      const completeListing = {
        ...basicInfo,
        website: website || null,
        phone: phone || null,
      };

      logger.debug(`Completed card ${index + 1}: ${JSON.stringify(completeListing)}`);

      return completeListing;
    } catch (error) {
      logger.debug(`Card processing error: ${error.message}`);
      return basicInfo;
    }
  }

  /**
   * Extract visible business data from results in the left panel
   */
  async extractListings() {
    try {
      logger.info('Extracting listings from visible results...');

      // Get all result item links (a.hfpxzc elements)
      const resultItems = await this.page.$$eval(
        'a.hfpxzc',
        (elements) =>
          elements.map((el) => {
            // The business name is in the aria-label attribute
            const ariaLabel = el.getAttribute('aria-label') || '';
            
            // Parse aria-label which usually has format: "Name · Rating · Address" or similar
            const parts = ariaLabel.split('·').map((p) => p.trim());
            const name = parts[0] || null;
            
            let rating = null;
            let address = null;
            
            if (parts.length > 1) {
              // Check patterns for rating vs address
              if (/\d+[.,]?\d*\s*(stars?|étoiles?|★)/.test(parts[1])) {
                rating = parts[1];
                address = parts[2] || null;
              } else {
                address = parts[1];
              }
            }

            return {
              name,
              rating,
              address,
              ariaLabel,
              href: el.getAttribute('href'),
            };
          })
      );

      logger.debug(`Found ${resultItems.length} total result items on page`);

      // Process and clean extracted data
      const basicListings = resultItems
        .filter((item) => item.name && item.name.trim().length > 1)
        .map((item) => ({
          name: sanitizeText(item.name),
          rating: sanitizeText(item.rating),
          address: sanitizeText(item.address),
          category: null,
          url: item.href || null,
          extractedAt: new Date().toISOString(),
        }));

      logger.debug(`Processed ${basicListings.length} listings after filtering`);

      // Only process NEW cards (ones not yet processed)
      const newListings = [];
      const existingNames = new Set(this.listings.map(l => l.name)); // Get names of already processed cards
      
      for (let i = 0; i < basicListings.length; i++) {
        // Skip if already processed by index OR if name already exists in listings
        if (this.processedCardIndices.has(i) || existingNames.has(basicListings[i].name)) {
          logger.debug(`Skipping card ${i + 1} - already processed (${basicListings[i].name})`);
          continue;
        }
        
        const listing = await this.clickAndExtractDetail(i, basicListings[i]);
        newListings.push(listing);
        this.processedCardIndices.add(i); // Mark as processed
        existingNames.add(listing.name); // Add to existing names

        // Short delay between card clicks
        await sleep(200);
      }

      // Add new unique listings
      const previousCount = this.listings.length;
      this.listings = removeDuplicates([...this.listings, ...newListings], 'name');

      const newCount = this.listings.length - previousCount;
      if (newCount > 0) {
        logger.info(`✓ Extracted ${newCount} new unique listings (total: ${this.listings.length})`);
      } else {
        logger.debug(`No new listings extracted in this iteration`);
      }

      if (this.listings.length > 0) {
        logger.debug(`Sample listing: ${JSON.stringify(this.listings[0])}`);
      }

      return newCount > 0;
    } catch (error) {
      logger.error(`Extraction failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Check timeout based on runtime
   */
  isTimeoutExceeded() {
    const elapsed = (Date.now() - this.startTime) / 1000 / 60; // Convert to minutes
    const maxTime = CONFIG.limits.maxRuntimeMinutes;

    if (elapsed > maxTime) {
      logger.warning(`Runtime limit exceeded (${elapsed.toFixed(1)}/${maxTime} minutes)`);
      return true;
    }

    return false;
  }

  /**
   * Main scraping loop
   */
  async scrapeAll(query) {
    try {
      // Perform initial search
      const searchSuccess = await this.search(query);
      if (!searchSuccess) {
        logger.error('Initial search failed');
        return this.listings;
      }

      // Extract initial results
      await this.extractListings();

      // Scroll and extract in loop
      let consecutiveNoNewResults = 0;
      const MAX_NO_NEW_RESULTS = 8; // Allow more scrolls without new results before giving up

      while (
        this.listings.length < CONFIG.limits.maxResults &&
        this.scrollCount < CONFIG.limits.maxScrolls &&
        !this.isTimeoutExceeded()
      ) {
        logger.info(
          `Progress: ${this.listings.length}/${CONFIG.limits.maxResults} results ` +
          `(scroll ${this.scrollCount}/${CONFIG.limits.maxScrolls})`
        );

        // Check if we've reached the end of the list
        if (await this.isEndOfListReached()) {
          logger.success('End of list detected - scraping complete!');
          break;
        }

        // Scroll to load more
        const scrollSuccess = await this.scrollResults();
        if (!scrollSuccess) {
          logger.warning('Scrolling failed');
          break;
        }

        // Wait longer for new cards to load (Google Maps loads cards progressively)
        logger.debug('Waiting for new cards to load...');
        await sleep(2500); // Increased from 500ms to 2.5s

        // Extract new results
        const hadNewResults = await this.extractListings();

        if (!hadNewResults) {
          consecutiveNoNewResults++;
          logger.debug(`No new results extracted (${consecutiveNoNewResults}/${MAX_NO_NEW_RESULTS})`);

          if (consecutiveNoNewResults >= MAX_NO_NEW_RESULTS) {
            logger.info('No new results for several scrolls, attempting more scrolls...');
            // Try a few more scrolls before giving up completely
            for (let i = 0; i < 3; i++) {
              await this.scrollResults();
              await sleep(2500);
              const finalCheck = await this.extractListings();
              if (finalCheck) {
                logger.info('Found results on extended scroll!');
                consecutiveNoNewResults = 0;
                break;
              }
              // Check again for end of list
              if (await this.isEndOfListReached()) {
                logger.success('Reached end of list on extended scroll');
                return this.listings;
              }
            }
            // If still no results found, stop
            if (consecutiveNoNewResults >= MAX_NO_NEW_RESULTS) {
              logger.info('Still no new results after extended scrolls, stopping');
              break;
            }
          }
        } else {
          consecutiveNoNewResults = 0;
        }
      }

      // Check why we stopped
      if (this.listings.length >= CONFIG.limits.maxResults) {
        logger.success(`Reached result limit (${this.listings.length} results)`);
      } else if (this.scrollCount >= CONFIG.limits.maxScrolls) {
        logger.info(`Reached scroll limit (${this.scrollCount} scrolls)`);
      } else if (this.isTimeoutExceeded()) {
        logger.warning('Runtime limit exceeded');
      }

      logger.success(`✓ Scraping complete - Total listings: ${this.listings.length}`);
      return this.listings;
    } catch (error) {
      logger.error(`Scraping failed: ${error.message}`);
      return this.listings;
    }
  }

  /**
   * Clean up and close browser
   */
  async close() {
    try {
      logger.section('CLOSING BROWSER');

      if (this.page) {
        await this.page.close();
      }

      if (this.context) {
        await this.context.close();
      }

      if (this.browser) {
        await this.browser.close();
      }

      logger.success('Browser closed');
    } catch (error) {
      logger.error(`Failed to close browser: ${error.message}`);
    }
  }

  /**
   * Print summary of scraping session
   */
  printSummary() {
    logger.section('SCRAPING SUMMARY');

    const elapsed = (Date.now() - this.startTime) / 1000;
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);

    logger.info(`Total listings collected: ${this.listings.length}`);
    logger.info(`Total scrolls performed: ${this.scrollCount}`);
    logger.info(`Total time: ${minutes}m ${seconds}s`);
    logger.info(`Average per listing: ${(elapsed / this.listings.length).toFixed(1)}s`);

    if (this.listings.length > 0) {
      logger.success('\nSample listing:');
      console.log(JSON.stringify(this.listings[0], null, 2));
    }
  }
}

export default GoogleMapsScraper;
