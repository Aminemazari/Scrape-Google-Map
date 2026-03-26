````md
# 🗺️ Google Maps Business Listings Scraper

A **stable, human-like, low-volume** web scraper for collecting publicly visible business listings from Google Maps using **Playwright + Node.js**.

> ⚡ Features: REST API, CLI tool, authentication, intelligent scrolling, duplicate prevention, JSON/CSV export

---

## 📋 Table of Contents
- Features
- Quick Start
- API Server
- CLI Usage
- Configuration
- Output Format
- How It Works
- Safety & Ethics
- License

---
# 🗺️ Google Maps Business Listings Scraper

## 🎥 Live Demo

[![Watch Demo](https://img.youtube.com/vi/9DB4_ekxsMU/0.jpg)](https://www.youtube.com/watch?v=9DB4_ekxsMU)

## ✨ Features

### 🎯 Core Capabilities
- Extract business name, rating, address, phone, website
- REST API with authentication
- CLI tool for manual scraping
- Intelligent scrolling detection
- Automatic duplicate removal
- JSON & CSV export

### 🚀 Performance
- Human-like delays (800–1500ms randomized)
- Headful browser mode (visible automation)
- Fresh browser context per request
- Graceful error handling
- CAPTCHA detection & auto-stop

### 🔒 Safety
- Low volume (50–100 results max)
- Rate-limited scrolling
- 10-minute max runtime
- Respects Google Maps ToS
- No aggressive automation

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- npm or yarn

---

### 2. Installation

```bash
git clone https://github.com/Aminemazari/Scrape-Google-Map.git
cd scrape
npm install
````

---

### 3. Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
API_KEY=your-secure-key-here
```

---

### 4. Start Server

```bash
npm start
```

Server runs on:

```
http://localhost:3000
```

---

## 🌐 API Usage

### Health Check

```bash
curl http://localhost:3000/health
```

---

### Scrape Endpoint

```bash
curl -X POST http://localhost:3000/scrape \
-H "Content-Type: application/json" \
-H "x-api-key: your-secret-key" \
-d '{"query": "restaurants in New York"}'
```

---

### Response Example

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
      "url": "https://google.com/maps/place/...",
      "extractedAt": "2026-03-26T12:00:00.000Z"
    }
  ]
}
```

---

## 💻 CLI Usage

### Basic Search

```bash
npm run cli "coffee shops in Barcelona"
```

---

### With Options

```bash
npm start -- --query "hotels in Paris" --max-results 80
npm start -- -q "gyms" -m 50
```

---

### Output Files

```
results/
├── google_maps_listings.json
└── google_maps_listings.csv
```

---

## ⚙️ Configuration

Edit `src/config.js`

### Timing

```js
timing: {
  actionDelayMin: 2000,
  actionDelayMax: 5000,
  scrollDelayMin: 800,
  scrollDelayMax: 1500
}
```

---

### Limits

```js
limits: {
  maxResults: 100,
  maxScrolls: 20,
  maxRuntimeMinutes: 10
}
```

---

### Browser

```js
browser: {
  headless: false,
  slowMo: 100
}
```

---

## 📊 Output Format

### JSON

```json
{
  "name": "Restaurant Name",
  "rating": "4.5 stars",
  "address": "123 Main Street",
  "phone": "+1 555-0123",
  "website": "https://example.com",
  "category": "Restaurant",
  "extractedAt": "2026-03-26T12:00:00.000Z"
}
```

---

### CSV

```csv
name,rating,address,phone,website,category,extractedAt
Restaurant Name,4.5 stars,123 Main Street,+1 555-0123,https://example.com,Restaurant,2026-03-26T12:00:00.000Z
```

---

## 🧠 How It Works

1. Launch Chromium (Playwright)
2. Search Google Maps query
3. Extract visible listings
4. Scroll progressively (lazy load)
5. Click listings for extra details
6. Remove duplicates
7. Export JSON + CSV
8. Close browser

---

## ⚠️ Safety & Ethics

### Allowed

* Personal research
* Educational use
* Manual/low-volume scraping

### Not Allowed

* Bulk scraping entire regions
* Data resale
* High-frequency automation
* Violating Google Maps ToS

---

### Limits

* Max 100 results per run
* Max 10 minutes runtime
* CAPTCHA detection stops scraper
* Random delays to reduce load

---

## 📁 Project Structure

```
scrape/
├── src/
│   ├── server.js
│   ├── scraper.js
│   ├── index.js
│   ├── config.js
│   ├── exporter.js
│   └── utils.js
├── results/
├── .env.example
├── package.json
└── README.md
```

---

## 🔐 API Authentication

Required header:

```
x-api-key: YOUR_API_KEY
```

Generate key:

```bash
openssl rand -hex 32
```

---

## 🧩 Dependencies

* Playwright
* Express.js
* Node.js core modules

---

## 📄 License

MIT License © 2026 Lacos

---

## 🤝 Disclaimer

This tool is for **educational and personal research purposes only**.
Users are responsible for complying with applicable terms of service and laws.

```
```
