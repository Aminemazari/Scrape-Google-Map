/**
 * Contact Page Email Scraper
 * 
 * Copyright © 2026 Lacos
 * Licensed under MIT License
 * 
 * Scrapes /contact pages and extracts email addresses using Playwright
 */

import { chromium } from 'playwright';
import { Logger, sleep } from './utils.js';

const logger = new Logger();

/**
 * Scrape contact page and extract emails
 * @param {string} websiteUrl - Base website URL
 * @returns {Promise<string[]>} - Array of email addresses found
 */
export async function scrapeContactPage(websiteUrl) {
  let browser = null;

  try {
    logger.debug(`Scraping contact page for: ${websiteUrl}`);

    // Validate and clean URL
    let url = websiteUrl.trim();
    
    // Check if it has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Remove trailing slash if present
    url = url.replace(/\/$/, '');

    // Launch browser
    browser = await chromium.launch({
      headless: true,
      timeout: 30000
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });

    const page = await context.newPage();

    // Try /contact first
    let contactUrl = `${url}/contact`;
    logger.info(`Trying: ${contactUrl}`);

    let emails = [];

    // Try /contact route
    try {
      await page.goto(contactUrl, {
        waitUntil: 'load',
        timeout: 10000
      });
      logger.success(`✓ Contact page loaded`);
      
      // Get HTML and extract emails
      let html = await page.content();
      emails = extractEmails(html);

      if (emails.length > 0) {
        logger.success(`✓ Found ${emails.length} email(s) on /contact`);
        await context.close();
        await browser.close();
        return emails;
      }

      logger.info(`No emails found on /contact, trying /#contact...`);
    } catch (navError) {
      logger.warning(`Failed to load /contact: ${navError.message}`);
    }

    // If /contact failed or no emails found, try /#contact (hash-based routing)
    contactUrl = `${url}/#contact`;
    logger.info(`Trying hash route: ${contactUrl}`);
    
    try {
      await page.goto(contactUrl, {
        waitUntil: 'load',
        timeout: 10000
      });
      logger.success(`✓ Hash route loaded`);
      
      // Get HTML and extract emails
      let html = await page.content();
      emails = extractEmails(html);

      if (emails.length > 0) {
        logger.success(`✓ Found ${emails.length} email(s) on /#contact`);
      } else {
        logger.info('No emails found on /#contact either');
      }
    } catch (hashError) {
      logger.warning(`Failed to load /#contact: ${hashError.message}`);
    }

    // Cleanup
    await context.close();
    await browser.close();

    return emails;
  } catch (error) {
    logger.error(`Contact page scraping error: ${error.message}`);
    
    // Ensure cleanup
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        // Ignore close errors
      }
    }

    return [];
  }
}

/**
 * Extract email addresses from HTML content
 * @param {string} html - HTML content
 * @returns {string[]} - Array of unique email addresses
 */
function extractEmails(html) {
  try {
    // Email regex pattern (standard RFC 5322 simplified)
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    
    // Extract all email matches
    const matches = html.match(emailRegex) || [];
    
    logger.debug(`Found ${matches.length} email matches in HTML`);

    // Convert to lowercase and remove duplicates
    const uniqueEmails = [...new Set(matches.map(email => email.toLowerCase()))];
    
    // Filter out common false positives
    const validEmails = uniqueEmails.filter(email => {
      // Reject emails with consecutive dots
      if (email.includes('..')) return false;
      
      // Reject emails starting/ending with dot
      if (email.startsWith('.') || email.endsWith('.')) return false;
      
      // Reject emails with invalid patterns
      if (email.includes('@.') || email.includes('.@')) return false;

      // Reject some common false positives
      if (email.includes('example.com')) return false;
      if (email.includes('test.com')) return false;
      
      return true;
    });

    logger.debug(`Extracted ${validEmails.length} valid emails from HTML`);
    return validEmails;
  } catch (error) {
    logger.error(`Email extraction error: ${error.message}`);
    return [];
  }
}
