# Developer Guide

Architecture, design decisions, and advanced customization for developers.

## Architecture Overview

### Module Structure

```
src/
├── index.js          # CLI Layer - Argument parsing, main orchestration
├── scraper.js        # Core Logic - Playwright automation
├── exporter.js       # Data Layer - JSON/CSV persistence
├── config.js         # Configuration - All tunable parameters
└── utils.js          # Utilities - Logging, helpers, delays
```

### Data Flow

```
User Input (CLI)
     ↓
index.js (parse args, initialize)
     ↓
scraper.js (initialize browser)
     ↓
scraper.search() → Navigate to Maps, enter query
     ↓
scraper.scrapeAll() → Loop: extract → scroll → extract
     ↓
scraper.extractListings() → Parse DOM, deduplicate
     ↓
browser.close()
     ↓
exporter.saveResults() → JSON + CSV files
     ↓
Output files in results/
```

---

## Module Breakdown

### 1. `index.js` - Entry Point

**Responsibility**: CLI interface and orchestration

```javascript
// Exports:
- parseArguments()     // Parse CLI flags
- printHelp()          // Show usage
- main()               // Orchestrating function
- Handles signals (Ctrl+C)
```

**Key Flow:**
```
main()
  → parseArguments()      (get query, maxResults)
  → GoogleMapsScraper()   (create instance)
  → scraper.initialize()  (launch browser)
  → scraper.scrapeAll()   (run scraping loop)
  → scraper.printSummary()(log stats)
  → saveResults()         (export data)
  → scraper.close()       (cleanup)
```

### 2. `scraper.js` - Core Automation

**Responsibility**: Playwright interactions and data extraction

**Key Methods:**

```javascript
GoogleMapsScraper {
  initialize()             // Launch browser, create context
  search(query)            // Navigate Maps, search
  scrollResults()          // Scroll to load more
  extractListings()        // Parse visible data
  scrapeAll(query)         // Main loop
  isPageBlocked()          // Detect CAPTCHA
  isTimeoutExceeded()      // Check runtime limit
  close()                  // Cleanup browser
  printSummary()           // Log statistics
}
```

**Core Loop Logic:**

```javascript
async scrapeAll(query) {
  await this.search(query);        // Initial search
  await this.extractListings();    // First batch
  
  while (NOT_AT_LIMIT) {
    await this.scrollResults();     // Scroll for more
    const hadNew = await this.extractListings();
    
    if (!hadNew) {
      consecutiveNoNew++;
      if (consecutiveNoNew >= 3) break;
    } else {
      consecutiveNoNew = 0;
    }
    
    // Check limits
    if (timeout || resultLimit || scrollLimit) break;
  }
}
```

**Data Structure:**

```javascript
// Listing object
{
  name: "Business Name",
  rating: "4.5 stars",
  address: "123 Main St, City",
  category: "Restaurant",
  extractedAt: "2024-12-15T14:30:45.123Z"
}
```

### 3. `exporter.js` - Data Persistence

**Responsibility**: File I/O, JSON/CSV formatting

```javascript
saveToJSON(listings, query)    // → JSON with metadata
saveToCSV(listings, query)     // → CSV spreadsheet format
saveResults(listings, query)   // → Both formats
ensureOutputDir()              // → Create results/ if needed
```

**JSON Structure:**

```javascript
{
  metadata: {
    query: string,
    timestamp: ISO string,
    totalResults: number
  },
  listings: [
    { name, rating, address, category, extractedAt },
    // ...
  ]
}
```

**CSV Structure:**

```csv
"name","rating","address","category","extractedAt"
"Value1","Value2","Value3",...
```

### 4. `config.js` - Configuration

**Responsibility**: Constants and tunable parameters

**Key Sections:**

```javascript
CONFIG = {
  browser: {
    headless,      // false = visible window
    slowMo,        // Animation slowdown (ms)
    timeout,       // Page load timeout
  },
  timing: {
    actionDelayMin/Max,    // Delay between clicks, types
    scrollDelayMin/Max,    // Delay between scrolls
    elementWaitTimeout,    // Max wait for elements
    searchLoadDelay,       // Wait for search results
  },
  limits: {
    maxResults,            // Stop after N listings
    maxScrolls,            // Stop after N scrolls
    maxRuntimeMinutes,     // Stop after M minutes
  },
  selectors: {
    searchInput,
    resultsPanel,
    resultItem,
    // ... for finding elements
  },
  output: {
    dirPath,
    jsonFileName,
    csvFileName,
  },
}
```

**Design Decision**: This centralization makes configuration changes easy without touching code logic.

### 5. `utils.js` - Utilities

**Responsibilities:**
- Logging with timestamps
- Human-like delays
- Data cleaning
- Deduplication
- File naming

**Key Functions:**

```javascript
class Logger {
  info(msg)      // ℹ️ Blue
  success(msg)   // ✅ Green
  warning(msg)   // ⚠️ Yellow
  error(msg)     // ❌ Red
  debug(msg)     // 🔍 Debug (if verbose)
}

humanDelay(min, max)       // Sleep random ms
getRandomDelay(min, max)   // Calculate random value
removeDuplicates(arr, key) // Deduplicate objects
sanitizeText(text)         // Trim, normalize whitespace
getTimestamp()             // Generate timestamped filename
```

---

## Design Decisions

### 1. Why Headful Mode (visible browser)?

**Chosen:** `headless: false` (visible window)

**Rationale:**
- More human-like behavior
- Easier to debug/monitor
- Prevents accidental background hammering
- Encourages responsible usage (not farmable)

### 2. Why Randomized Delays?

**Chosen:** 2-5 seconds between actions + random scroll amounts

**Rationale:**
- Avoids detection patterns
- Simulates normal human browsing speed
- Reduces server load perception
- Prevents rate limiting

### 3. Why Deduplication?

**Chosen:** Remove duplicates by business name

**Rationale:**
- Scrolling can cause repeated results in DOM
- Prevents inflated numbers
- Cleaner data exports

### 4. Why Modular Architecture?

**Chosen:** Separate scraper, exporter, utils, config

**Rationale:**
- Easy to test independently
- Simple to modify/extend individual modules
- Clear separation of concerns
- Easy to spot bugs

### 5. Why JSON + CSV Output?

**Chosen:** Both formats

**Rationale:**
- JSON: Machine readable, contains metadata
- CSV: Human readable in spreadsheets
- Caters to different use cases
- Redundancy/backup

---

## Extension Points

### Add Custom Fields to Extraction

**In `scraper.js`, modify `extractListings()`:**

```javascript
const newListings = resultItems
  .filter(item => item.name)
  .map(item => ({
    name: sanitizeText(item.name),
    rating: sanitizeText(item.rating),
    address: sanitizeText(item.address),
    
    // ADD NEW FIELDS HERE
    phone: extractPhone(item.rawHTML),
    email: extractEmail(item.rawHTML),
    hours: item.hours,
    website: item.website,
    
    extractedAt: new Date().toISOString(),
  }))
```

Then implement extraction helper:
```javascript
function extractPhone(html) {
  const phoneMatch = html.match(/\d{3}-?\d{3}-?\d{4}/);
  return phoneMatch ? phoneMatch[0] : null;
}
```

### Modify Selectors (If Google Maps UI Changes)

**In `config.js`:**

```javascript
selectors: {
  // Old selector no longer works?
  // resultItem: '[role="option"]',  ❌ OLD
  
  // Update with new one:
  resultItem: '.business-result, [data-result-id]',  ✅ NEW
}
```

Use browser DevTools to find new selectors:
1. Open script with `npm start`
2. Press F12 in browser
3. Inspect Google Maps result elements
4. Copy selector, update config.js

### Custom Pre/Post Processing

**Add to `index.js` before `saveResults()`:**

```javascript
// Transform listings before saving
const processedListings = scraper.listings
  .map(listing => ({
    ...listing,
    city: "Barcelona",           // Add city
    searchDate: new Date().toLocaleDateString(),
    verified: false,             // Add verification flag
  }));

await saveResults(processedListings, query);
```

### Change Timing Strategy

**In `config.js`, adjust for different strategies:**

```javascript
// AGGRESSIVE (still safe, for reliable networks)
timing: {
  actionDelayMin: 1000,
  actionDelayMax: 2000,
  scrollDelayMin: 800,
  scrollDelayMax: 1500,
}

// CONSERVATIVE (very respectful)
timing: {
  actionDelayMin: 4000,
  actionDelayMax: 7000,
  scrollDelayMin: 3000,
  scrollDelayMax: 5000,
}
```

### Add Database Persistence

**Create `src/database.js`:**

```javascript
import sqlite3 from 'better-sqlite3';

export function saveToDatabase(listings, query) {
  const db = new sqlite3('listings.db');
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS listings (
      id INTEGER PRIMARY KEY,
      name TEXT,
      rating TEXT,
      address TEXT,
      query TEXT,
      extracted_at TEXT
    )
  `);
  
  const insert = db.prepare(`
    INSERT INTO listings (name, rating, address, query, extracted_at)
    VALUES (?, ?, ?, ?, ?)
  `);
  
  listings.forEach(listing => {
    insert.run(
      listing.name,
      listing.rating,
      listing.address,
      query,
      listing.extractedAt
    );
  });
}
```

Then use in `index.js`:
```javascript
import { saveToDatabase } from './database.js';

await saveToDatabase(scraper.listings, query);
```

---

## Troubleshooting Guide for Developers

### Issue: No results extracted despite visible results

**Debug steps:**

```javascript
// In scraper.js, add in extractListings():
const elements = await this.page.$$eval(
  CONFIG.selectors.resultItem,
  els => els.length
);
logger.debug(`Found ${elements} elements`);

// Check what's in the elements:
const rawText = await this.page.$eval(
  CONFIG.selectors.resultItem,
  el => el?.textContent
);
logger.debug(`First element text: ${rawText}`);
```

**Common causes:**
- Selector doesn't match current Google Maps UI
- Elements load dynamically (need more wait time)
- Results panel structure changed

### Issue: Infinite loop / no stop condition met

**Debug:**

```javascript
// In scraper.js, modify scrapeAll():
while (...) {
  logger.debug(`Loop state: results=${this.listings.length}, scrolls=${this.scrollCount}, time=${elapsed}m`);
  
  if (this.listings.length >= CONFIG.limits.maxResults) {
    logger.info('Would break due to result limit');
    break;
  }
  // ... rest of conditions
}
```

### Issue: CAPTCHA triggers frequently

**Solutions:**

1. Increase delays:
```javascript
timing: {
  actionDelayMin: 5000,
  actionDelayMax: 8000,
}
```

2. Limit results per session:
```javascript
limits: {
  maxResults: 20,  // Fewer attempts
}
```

3. Run fewer times:
```
# Run once per day, wait 24 hours between runs
npm start -- "restaurants" # Monday
# Wait 24 hours
npm start -- "cafes"       # Tuesday
```

### Issue: Memory leak / browser doesn't close

**Add timeouts:**

```javascript
// In scraper.js
setTimeout(() => {
  logger.error('Force timeout after 15 minutes');
  process.exit(1);
}, 15 * 60 * 1000);

// In try/finally:
try {
  await scraper.scrapeAll(query);
} finally {
  await scraper.close();
}
```

---

## Performance Optimization

### For Large-Scale Testing

```javascript
// config.js - Fast mode (for testing)
timing: {
  actionDelayMin: 500,
  actionDelayMax: 1000,
}
limits: {
  maxResults: 10,
  maxScrolls: 2,
}
```

### For Maximum Respect

```javascript
// config.js - Ultra-safe
timing: {
  actionDelayMin: 6000,
  actionDelayMax: 10000,
}
limits: {
  maxResults: 15,
  maxScrolls: 5,
}
```

---

## Testing

### Unit Test Example

```javascript
// test/utils.test.js
import { removeDuplicates, sanitizeText } from '../src/utils.js';

console.log('Testing removeDuplicates...');
const items = [
  { name: 'Cafe' },
  { name: 'cafe' },  // Duplicate (case-insensitive)
  { name: 'Bakery' }
];
const result = removeDuplicates(items);
console.assert(result.length === 2, 'Should remove duplicates');

console.log('Testing sanitizeText...');
const text = '  Too   Many   Spaces  ';
const clean = sanitizeText(text);
console.assert(clean === 'Too Many Spaces', 'Should normalize whitespace');
```

Run with:
```bash
node test/utils.test.js
```

---

## Contributing / Improvements

### Areas for Enhancement

1. **Retry logic** - Retry scrolls on temporary failures
2. **Concurrent runs** - Multiple browsers simultaneously
3. **Proxy support** - Use proxy rotation
4. **Image capture** - Screenshot listings
5. **Details page** - Click into each result for more info
6. **Reviews extraction** - Get review snippets
7. **Analytics** - Track patterns, clustering
8. **Web UI** - Simple dashboard for results

---

## References

- [Playwright Documentation](https://playwright.dev/)
- [Google Maps Terms of Service](https://policies.google.com/terms)
- [Responsible Web Scraping](https://blog.apify.com/web-scraping-best-practices/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Remember:** Great code is maintainable, testable, and respectful of users and services. ✨
