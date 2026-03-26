# Usage Examples

Practical examples for different research scenarios.

## Basic Examples

### 1. Search for Restaurants
```bash
npm start -- "restaurants in Barcelona"
```
Collects up to 60 restaurants (default limit).

### 2. Search for Coffee Shops (Limit Results)
```bash
npm start -- --query "coffee shops in Paris" --max-results 30
```
Stops after finding 30 coffee shops.

### 3. Search for Hotels (Long Search)
```bash
npm start -- "hotels near Central Station" -m 80
```
Uses short flag syntax, collects 80 hotels.

---

## Specific Use Cases

### Research Project: Local Businesses

**Goal**: Collect data about restaurants, cafes, and gyms in a specific area.

```bash
# Restaurants
npm start -- "restaurants in Barcelona" --max-results 60

# Cafes
npm start -- "cafes in Barcelona" --max-results 60

# Gyms
npm start -- "gyms in Barcelona" --max-results 50
```

**Output**: Three CSV files in `results/` directory with timestamped names.

### Market Research: Medical Services

**Goal**: Compare medical facilities across regions.

```bash
# Hospitals in one city
npm start -- "hospitals in Barcelona"

# Clinics in another city (run separately)
npm start -- "medical clinics in Madrid"

# Pharmacies
npm start -- "pharmacies in Valencia"
```

### Price Research: Specific Services

**Goal**: Find businesses offering a specific service.

```bash
# Hair salons
npm start -- "hair salons near me" --max-results 50

# Auto repair
npm start -- "auto repair shops" -m 40

# Plumbers
npm start -- "plumbing services" -m 45
```

### Tourism Research: Attractions

**Goal**: Collect information about tourist attractions.

```bash
# Museums
npm start -- "museums in Paris"

# Hotels
npm start -- "hotels in Barcelona"

# Restaurants rated 4+
npm start -- "highly rated restaurants in Rome" -m 60
```

---

## Advanced Examples

### Slow & Steady Collection (Respectful)

For maximum respect of resources, with longer delays:

```javascript
// Edit src/config.js temporarily:
timing: {
  actionDelayMin: 4000,    // 4-6 second delays
  actionDelayMax: 6000,
  scrollDelayMin: 2000,    // Slower scrolling
  scrollDelayMax: 4000,
}
limits: {
  maxResults: 30,          // Fewer results per run
  maxScrolls: 8,           // Fewer scrolls
  maxRuntimeMinutes: 8,
}
```

Then run:
```bash
npm start -- "coffee shops"
```

### Efficient Collection (Still Safe)

For moderate pacing with good efficiency:

```javascript
// Edit src/config.js:
timing: {
  actionDelayMin: 2000,    // 2-4 second delays (default is 2-5)
  actionDelayMax: 4000,
  scrollDelayMin: 1000,
  scrollDelayMax: 2500,
}
limits: {
  maxResults: 80,          // More results
  maxScrolls: 20,
  maxRuntimeMinutes: 12,
}
```

### Multiple Searches in Sequence

```bash
# Run one after another (with manual pauses between)

npm start -- "restaurants in Barcelona"
# Wait 10-15 minutes

npm start -- "restaurants in Madrid"
# Wait 10-15 minutes

npm start -- "restaurants in Valencia"
```

---

## Interpreting Results

### JSON Output Example

```json
{
  "metadata": {
    "query": "restaurants in Barcelona",
    "timestamp": "2024-12-15T14:30:45.123Z",
    "totalResults": 47
  },
  "listings": [
    {
      "name": "La Boqueria",
      "rating": "4.6 stars",
      "address": "Las Ramblas, Barcelona",
      "category": "Food Market",
      "extractedAt": "2024-12-15T14:32:12.456Z"
    },
    {
      "name": "Casa Batllo",
      "rating": "4.7 stars",
      "address": "Passeig de Gracia, Barcelona",
      "category": "Historic Site",
      "extractedAt": "2024-12-15T14:33:45.789Z"
    }
  ]
}
```

### CSV Output

Open in Excel, Google Sheets, or any spreadsheet tool:

| name | rating | address | category | extractedAt |
|------|--------|---------|----------|------------|
| La Boqueria | 4.6 stars | Las Ramblas, Barcelona | Food Market | 2024-12-15T14:32:12Z |
| Casa Batllo | 4.7 stars | Passeig de Gracia, Barcelona | Historic Site | 2024-12-15T14:33:45Z |

---

## Troubleshooting Common Issues

### Issue: Very Few Results
**Solution**: Try broader search term
```bash
# Too specific
npm start -- "vegetarian sushi restaurants"

# Better
npm start -- "sushi restaurants"
```

### Issue: Timeout
**Solution**: Increase timeout or use fewer results
```bash
# Edit config.js:
limits: {
  maxResults: 30,      // Fewer results = faster
  maxRuntimeMinutes: 15, // More time available
}
```

### Issue: CAPTCHA Block
```
❌ Page appears to be blocked (CAPTCHA detected)
```
**Solution**: Wait 5-24 hours before retrying. Increase delays in config.

### Issue: Incomplete Address/Rating
**Solution**: This is expected - Google Maps doesn't always display all data in the results list. Only visible data is captured.

---

## Data Analysis Examples

### After Collection

```bash
# 1. View JSON results
cat results/2024-12-15-1430_google_maps_listings.json

# 2. Open CSV in Excel/Sheets for analysis
# results/2024-12-15-1430_google_maps_listings.csv

# 3. Count results
wc -l results/*.csv

# 4. Find highest rated (in Excel/Sheets)
# Sort by rating column descending
```

### Integration Examples

You can use the JSON output with other tools:

```bash
# Convert to other formats
jq '.listings[].name' results/*.json  # Extract names

# Filter by rating (requires jq tool)
cat results/*.json | jq '.listings[] | select(.rating | contains("4."))'

# Export to database (using Python pandas or similar)
# Or import into Google Sheets for analysis
```

---

## Scheduling (Manual)

Remember: This script is NOT intended for automation/continuous runs.

**Good practice:**
- Run occasionally for research (once a day max per query)
- Leave 10-15 minutes between runs
- Vary search terms and locations
- Combine multiple runs into analysis

**Poor practice:**
- Run multiple times per minute
- Farm data continuously
- Target specific businesses for competitive purposes
- Sell or redistribute data

---

## Performance Expectations

| Scenario | Time | Results | Notes |
|----------|------|---------|-------|
| Small city, basic query | 3-4 min | 30-50 | Fast load, fewer results |
| Medium city, specific query | 5-7 min | 50-80 | Standard case, good results |
| Large city, broad query | 8-10 min | 80-100 | Reaches limits naturally |
| Blocked/CAPTCHA | <1 min | 0-20 | Script stops, saves partial |

---

**Always respect data and services. Use responsibly.** 🤝
