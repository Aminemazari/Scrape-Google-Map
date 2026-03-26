# 🗺️ Google Maps Business Listings Scraper

A **stable, human-like, low-volume** web scraper for collecting publicly visible business listings from Google Maps. Built with **Playwright** for personal research and automated business data collection.

> ⚡ **Key Features**: REST API, CLI tool, authentication, phone number extraction, intelligent scrolling, duplicate prevention

---

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [API Server](#api-server)
- [Configuration](#configuration)
- [Output](#output)
- [How It Works](#how-it-works)
- [License](#license)

---

## ✨ Features

### 🎯 Core Capabilities
- ✅ Extract business name, rating, address, phone, website
- ✅ REST API with authentication
- ✅ CLI tool for manual scraping
- ✅ Intelligent scrolling detection (200-400px increments)
- ✅ Automatic duplicate prevention
- ✅ End-of-results detection
- ✅ JSON & CSV export formats

### 🚀 Performance
- ✅ Human-like behavior (randomized delays: 800-1500ms)
- ✅ Headful mode (visible browser)
- ✅ Fresh context per request
- ✅ Graceful error handling
- ✅ CAPTCHA detection & abort

### 🔒 Safety & Ethics
- ✅ Low-volume (50-100 results max)
- ✅ Rate-limited scrolls
- ✅ 10-minute max runtime
- ✅ Respects Google Maps ToS
- ✅ No aggressive automation

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v18+
- **npm** or yarn

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Aminemazari/Scrape-Google-Map.git
cd scrape

# Install dependencies
npm install
```

### 3. Set Up Environment

```bash
# Copy example config
cp .env.example .env

# Edit .env with your API key
# PORT=3000
# API_KEY=your-secure-key-here
```

### 4. Start the Server

```bash
npm start
```

Server runs on `http://localhost:3000`

---

## 🌐 API Server

### Health Check
```bash
curl http://localhost:3000/health
```

**Response:**
```json
{
  "status": "healthy",
  "uptime": 245.123,
  "timestamp": "2026-03-26T12:00:00.000Z"
}
```

### Scrape Endpoint (POST /scrape)

```bash
curl -X POST http://localhost:3000/scrape \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-change-me" \
  -d '{"query": "restaurants in New York"}'
```

**Response:**
```json
{
  "success": true,
  "query": "restaurants in New York",
  "totalListings": 42,
  "data": [
    {
      "name": "Best Pizza Place",
      "rating": "4.5 stars",
      "address": "123 Main St, New York",
      "phone": "+1 555-0123",
      "website": "https://example.com",
      "category": null,
      "url": "https://google.com/maps/place/...",
      "extractedAt": "2026-03-26T12:00:00.000Z"
    }
    // ... more listings
  ],
  "timestamp": "2026-03-26T12:00:00.000Z"
}
```

### API Documentation
```bash
curl http://localhost:3000/docs
```

---

## 💻 CLI Tool

### Basic Search

```bash
npm run cli "coffee shops in Barcelona"
```

### Output Files
Results automatically save to `./results/`:
```
results/
├── 2026-03-26T120000Z_google_maps_listings.json
└── 2026-03-26T120000Z_google_maps_listings.csv
```

---

## ⚙️ Configuration

Edit `src/config.js` to customize:

```javascript
// Timing (milliseconds)
timing: {
  actionDelayMin: 2000,    // Min delay between actions
  actionDelayMax: 5000,    // Max delay between actions
  scrollDelayMin: 800,     // Min delay between scrolls
  scrollDelayMax: 1500,    // Max delay between scrolls
}

// Collection limits
limits: {
  maxResults: 100,         // Stop after N listings
  maxScrolls: 20,          // Stop after N scroll actions
  maxRuntimeMinutes: 10,   // Stop after N minutes
}

// Browser
browser: {
  headless: false,         // false = visible, true = headless
  slowMo: 100,             // Animation slowdown (ms)
}
```

---

## 📊 Output

### JSON Format
```json
{
  "name": "Restaurant Name",
  "rating": "4.5 stars",
  "address": "123 Main Street",
  "phone": "+1 555-0123",
  "website": "https://example.com",
  "category": "Restaurant",
  "url": "https://google.com/maps/place/...",
  "extractedAt": "2026-03-26T12:00:00.000Z"
}
```

### CSV Format
```csv
name,rating,address,phone,website,category,extractedAt
Restaurant Name,4.5 stars,123 Main Street,+1 555-0123,https://example.com,Restaurant,2026-03-26T12:00:00.000Z
```

---

## 🔧 How It Works

### 1. **Initialize**
   - Launch Chromium browser
   - Set user-agent & viewport

### 2. **Search**
   - Navigate to Google Maps
   - Enter search query
   - Submit search

### 3. **Extract Initial Results**
   - Parse visible listings
   - Extract name, rating, address
   - Track processed cards

### 4. **Intelligent Scrolling**
   - Scroll container 200-400px
   - Wait 800-1500ms for lazy-load
   - Detect new cards
   - Repeat until end-of-list found

### 5. **Detail Extraction**
   - Click each listing
   - Extract phone & website
   - Click detail card
   - Return to results

### 6. **Export**
   - Remove duplicates
   - Save JSON & CSV
   - Print statistics

### 7. **Cleanup**
   - Close browser
   - Release resources

---

## 📁 Project Structure

```
scrape/
├── package.json              # Dependencies & npm scripts
├── .env.example              # Environment config template
├── LICENSE                   # MIT License
├── README.md                 # This file
├── src/
│   ├── server.js            # Express REST API
│   ├── scraper.js           # Core Playwright scraper
│   ├── index.js             # CLI entry point
│   ├── config.js            # Configuration constants
│   ├── exporter.js          # JSON/CSV export
│   └── utils.js             # Helpers & logger
└── results/                 # Output directory (auto-created)
```

---

## 📦 Dependencies

- **Playwright** - Browser automation
- **Express.js** - REST API framework
- **Node.js Core** - fs, path modules

No external scraping libraries. Pure Playwright + Express.

---

## 🔐 API Authentication

The server requires API key authentication via `x-api-key` header:

```bash
# Generate a secure key
openssl rand -hex 32

# Use in requests
curl -X POST http://localhost:3000/scrape \
  -H "x-api-key: YOUR_GENERATED_KEY" \
  -d '{"query": "search term"}'
```

Environment variable:
```env
API_KEY=your-secret-key-change-this
```

---

## ⚠️ Important Notes

### Compliance
- ✅ For personal research only
- ✅ Collects public data visible on Google Maps
- ✅ Respects Terms of Service
- ❌ Not for commercial bulk scraping
- ❌ Not for competitive intelligence
- ❌ Not for resale or redistribution

### Rate Limiting
- Max 100 results per run
- Max 20 scroll actions
- 10-minute timeout
- 800-1500ms delays between actions

### Error Handling
If CAPTCHA is detected, the scraper automatically stops. This is intentional to respect Google's security.

---

## 📄 License

**Copyright © 2026 Lacos**

Licensed under the **MIT License** - see [LICENSE](./LICENSE) file.

**Disclaimer**: Users are responsible for complying with Google Maps Terms of Service and local laws regarding web scraping. The authors assume no liability for misuse.

---

## 🤝 Contributing

Found a bug? Want to improve something?

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
1. Check [EXAMPLES.md](./EXAMPLES.md) for usage examples
2. Review [DEVELOPER.md](./DEVELOPER.md) for technical details
3. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for quick tips

---

**Built with ❤️ by Lacos | Powered by Playwright**
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
#   S c r a p e - G o o g l e - M a p 
 
 #   S c r a p e - G o o g l e - M a p 
 
 