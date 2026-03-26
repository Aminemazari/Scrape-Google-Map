# Google Maps Business Listings Scraper

A **stable, low-volume, human-like** Playwright script for collecting publicly visible business listings from Google Maps for personal research use.

## Features

✅ **Human-like behavior**
- Headful mode (visible browser window)
- Randomized delays between actions (2-5 seconds)
- Gradual, natural scrolling
- Random user-agent and viewport

✅ **Stability & Safety**
- Fresh browser context per run
- Resilient selectors with fallbacks
- CAPTCHA detection with automatic abort
- Timeout protections
- Graceful error handling

✅ **Rate Limiting**
- Maximum 50-100 results per run (configurable)
- Maximum 15 scroll actions (configurable)
- Maximum runtime of 10 minutes (configurable)
- No aggressive automation or repeated requests

✅ **Data Quality**
- Duplicate detection and removal
- Clean JSON and CSV output
- Timestamped results
- Visible data only (no hidden/private data)

✅ **Code Quality**
- Modular, well-organized structure
- Clear comments and logging
- Easy parameter configuration
- No external scraping frameworks

## Project Structure

```
scrape/
├── package.json                 # Dependencies and scripts
├── src/
│   ├── index.js                # Main entry point with CLI
│   ├── config.js               # Configuration and constants
│   ├── scraper.js              # Core Playwright scraper
│   ├── exporter.js             # JSON and CSV export
│   ├── utils.js                # Utility functions and logger
│   └── .gitignore              # Ignore node_modules, results
└── results/                     # Output directory (auto-created)
    ├── 2024-12-15-1430_google_maps_listings.json
    └── 2024-12-15-1430_google_maps_listings.csv
```

## Installation

### 1. Install Node.js LTS
Download from [nodejs.org](https://nodejs.org/) (v18+)

### 2. Install Dependencies

```bash
cd "vibe coded project/scrape"
npm install
```

This installs:
- **Playwright** (with Chromium browser)

## Quick Start

### Basic Usage

```bash
npm start
```

Runs with default query: "restaurants near me" (collects up to 60 listings)

### Custom Query

```bash
npm start -- "coffee shops in Barcelona"
```

### With Options

```bash
npm start -- --query "hotels in Paris" --max-results 80
npm start -- -q "gyms" -m 50
```

### Full Help

```bash
npm start -- --help
node src/index.js -h
```

## Usage Examples

```bash
# Search for restaurants
npm start -- "restaurants in New York"

# Limit results to 30
npm start -- --query "hospitals" --max-results 30

# Search with short flags
node src/index.js -q "offices" -m 100

# Help and documentation
npm start -- --help
```

## Configuration

Edit `src/config.js` to customize behavior:

### Timing & Pacing

```javascript
timing: {
  actionDelayMin: 2000,    // Minimum delay between actions (ms)
  actionDelayMax: 5000,    // Maximum delay between actions (ms)
  scrollDelayMin: 1500,    // Delay between scrolls
  scrollDelayMax: 3500,    // Random up to this value
  searchLoadDelay: 3000,   // Wait for initial search results
  elementWaitTimeout: 10000, // Max wait for elements
}
```

### Collection Limits

```javascript
limits: {
  maxResults: 60,           // Stop after 60 listings
  maxScrolls: 15,           // Stop after 15 scroll actions
  maxRuntimeMinutes: 10,    // Stop after 10 minutes
}
```

### Browser Behavior

```javascript
browser: {
  headless: false,          // Run in headful mode (visible)
  slowMo: 100,              // Slow down animations (ms)
  timeout: 30000,           // Page load timeout
}
```

### Output Location

```javascript
output: {
  dirPath: './results',
  jsonFileName: 'google_maps_listings.json',
  csvFileName: 'google_maps_listings.csv',
}
```

## Output Format

### JSON
```json
{
  "metadata": {
    "query": "restaurants in Barcelona",
    "timestamp": "2024-12-15T14:30:45.123Z",
    "totalResults": 47
  },
  "listings": [
    {
      "name": "La Boqueria Market",
      "rating": "4.6 stars",
      "address": "Las Ramblas, Barcelona",
      "category": "Food Market",
      "extractedAt": "2024-12-15T14:32:12.456Z"
    },
    // ... more listings
  ]
}
```

### CSV
```
"name","rating","address","category","extractedAt"
"La Boqueria Market","4.6 stars","Las Ramblas, Barcelona","Food Market","2024-12-15T14:32:12.456Z"
"Casa Batllo","4.7 stars","Passeig de Gracia, Barcelona","Architecture","2024-12-15T14:32:45.789Z"
```

## How It Works

### 1. Initialization
- Launches Chromium in headful mode (visible window)
- Creates fresh browser context with user-agent spoofing
- Sets random viewport size

### 2. Search
- Navigates to Google Maps
- Clicks search input with human-like delay
- Types search query gradually
- Submits and waits for results panel

### 3. Extraction
- Extracts visible business names and information
- Automatically deduplicates listings
- Cleans and sanitizes text data

### 4. Scrolling
- Scrolls gradually with random intervals (1.5-3.5 seconds)
- Loads more results incrementally
- Stops when:
  - Result limit reached
  - Scroll limit reached
  - Runtime exceeds max time
  - 3 consecutive scrolls yield no new results
  - CAPTCHA detected

### 5. Export
- Saves to timestamped JSON and CSV files
- Removes duplicates
- Includes extraction timestamps

### 6. Cleanup
- Closes all browser resources
- Prints summary statistics

## Safety & Ethics

This script is designed to be **respectful of Google Maps' resources**:

- ✅ **Low volume**: Max 50-100 results per run, intended for manual runs only
- ✅ **Human pacing**: 2-5 second delays, gradual scrolling
- ✅ **No automation farming**: Not designed for continuous operation or high-frequency runs
- ✅ **Visible data only**: Collects only publicly displayed information
- ✅ **CAPTCHA detection**: Stops immediately if blocked
- ✅ **Short sessions**: Max 10 minutes per run

**Not intended for:**
- Bulk scraping entire cities
- Competitive data harvesting
- Selling or redistributing data
- Violating Google Maps' Terms of Service
- Excessive automation

## Error Handling

### CAPTCHA Detected
```
❌ Page appears to be blocked (CAPTCHA detected)
```
Script stops immediately. Wait a few hours before retrying.

### Timeout
```
⚠️  Runtime limit exceeded (10.1/10 minutes)
```
Script stops and saves collected results.

### Missing Elements
```
⚠️  Results panel not found, continuing anyway...
```
Script attempts to proceed with extraction anyway.

## Troubleshooting

### "Chromium timeout" or page doesn't load
- Increase `CONFIG.browser.timeout` to 60000 (60 seconds)
- Check internet connection
- Try different search query

### Very few results collected
- Google Maps may not have many results for your query
- Try broader search term ("restaurants" vs "Lebanese restaurants")
- Check that results panel is loading (visible search results on screen)

### Results seem incomplete
- Google Maps limits visible results on first load
- More results appear as you scroll
- Increase `CONFIG.limits.maxScrolls` for more thorough scraping
- Increase `CONFIG.limits.maxRuntimeMinutes`

### "Search input not found"
- Google Maps UI may have changed
- Update `CONFIG.selectors.searchInput` with new selectors
- Contact maintainer if persists

## Logs and Debugging

Enable verbose logging in `config.js`:

```javascript
logging: {
  verbose: true,      // Show debug messages
  logTimestamps: true, // Show timestamps
}
```

Output includes:
- ✅ Success messages (green)
- ℹ️ Info messages (blue)
- 🔍 Debug messages (visible if verbose enabled)
- ⚠️ Warnings (yellow)
- ❌ Errors (red)

## Performance Metrics

Typical session:
- **Time**: 3-8 minutes for 50 results
- **Results per minute**: ~7-10
- **API calls**: ~1 search + ~5-15 scroll interactions
- **Browser memory**: ~150-300 MB

## Advanced Customization

### Change Selectors (if Google Maps UI updates)

```javascript
// src/config.js
selectors: {
  searchInput: '[aria-label="Search on Google Maps"]',
  resultsPanel: '[role="main"] [role="feed"]',
  resultItem: '[role="option"]',
  // ... update as needed
}
```

### Customize Timing per Session

```javascript
// Modify before running
CONFIG.timing.actionDelayMin = 3000;  // 3+ second delays
CONFIG.limits.maxResults = 30;         // Fewer results
CONFIG.limits.maxRuntimeMinutes = 5;   // Faster timeout
```

### Extract Additional Fields

Modify `scraper.js` `extractListings()` function to parse more data:

```javascript
const newListings = resultItems
  .filter(item => item.name)
  .map(item => ({
    name: sanitizeText(item.name),
    rating: sanitizeText(item.rating),
    // Add more fields:
    phone: sanitizeText(item.phone),
    hours: sanitizeText(item.hours),
  }))
```

## Limitations

- **Display-only**: Can only extract visible text (not hidden data)
- **Single query**: One search per run
- **Rate limited**: Designed for occasional manual runs only
- **Google UI dependent**: Updates to Google Maps may break selectors
- **No authentication**: Cannot access logged-in user features

## Dependencies

- **Playwright**: Browser automation and web scraping
- **Node.js Core**: fs, path (file system)

No external scraping frameworks, no Puppeteer, no Cheerio - just clean Playwright code.

## License

**Copyright © 2026 Lacos. All rights reserved.**

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

### Usage Rights
- ✅ Personal research and educational use
- ✅ Modify for your own projects
- ✅ Redistribute under MIT license with attribution

### Restrictions
- ⛔ Commercial use without permission
- ⛔ Violating Google Maps Terms of Service
- ⛔ Automated mass scraping without rate limiting
- ⛔ Scraping private or sensitive data

**Disclaimer**: This tool is provided for personal research purposes only. Users are responsible for complying with Google Maps Terms of Service and local laws regarding web scraping. The authors assume no liability for misuse.

## Support & Feedback

For issues or improvements:
1. Check your configuration in `src/config.js`
2. Verify Google Maps is loading correctly
3. Check network connection
4. Try different search terms

---

**Remember**: This tool is for personal research and occasional use only. Respect Google Maps' Terms of Service and gather data responsibly. 🚀
#   S c r a p e - G o o g l e - M a p  
 