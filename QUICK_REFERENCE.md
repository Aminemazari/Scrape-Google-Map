# Quick Reference

Fast lookup table for common commands and configurations.

## Commands Cheat Sheet

### Basic Commands

```bash
# Help and documentation
npm start -- --help          # Show all options
npm start -- -h              # Short version

# Default search
npm start                     # Uses "restaurants near me"

# Custom search
npm start -- "QUERY"         # Search for something
npm start -- -q "QUERY"      # Same, with flag
npm start -- --query "QUERY" # Long flag version

# Custom limit
npm start -- "QUERY" -m 30   # Collect max 30 results
npm start -- "QUERY" --max-results 80  # Long version

# Combined
npm start -- -q "hotels in Paris" -m 50
npm start -- --query "coffee bars" --max-results 30
```

## Configuration Quick Access

**File**: `src/config.js`

| Setting | Default | Purpose | Range |
|---------|---------|---------|-------|
| `actionDelayMin` | 2000 | Min delay between clicks (ms) | 500-5000 |
| `actionDelayMax` | 5000 | Max delay | 1000-10000 |
| `maxResults` | 60 | Stop after N listings | 10-100 |
| `maxScrolls` | 15 | Stop after N scrolls | 5-30 |
| `maxRuntimeMinutes` | 10 | Stop after M minutes | 5-30 |
| `headless` | false | Visible window? | true/false |

## Timing Presets

### Fast Mode (Testing)
```javascript
timing: { actionDelayMin: 500, actionDelayMax: 1000 },
limits: { maxResults: 15, maxScrolls: 5 },
```

### Standard Mode (Default)
```javascript
timing: { actionDelayMin: 2000, actionDelayMax: 5000 },
limits: { maxResults: 60, maxScrolls: 15 },
```

### Slow Mode (Safe)
```javascript
timing: { actionDelayMin: 4000, actionDelayMax: 7000 },
limits: { maxResults: 30, maxScrolls: 8 },
```

## File Locations

| What | Location |
|------|----------|
| Project Root | `C:\...\vibe coded project\scrape\` |
| Results | `C:\...\vibe coded project\scrape\results\` |
| Main Script | `src/index.js` |
| Config | `src/config.js` |
| Documentation | `README.md`, `EXAMPLES.md`, `SETUP.md` |

## Output Format

### JSON File Structure
```json
{
  "metadata": {
    "query": "search term",
    "timestamp": "2024-12-15T14:30:45Z",
    "totalResults": 47
  },
  "listings": [
    {
      "name": "Business Name",
      "rating": "4.5 stars",
      "address": "123 Main St",
      "category": "Restaurant",
      "extractedAt": "2024-12-15T14:32:12Z"
    }
  ]
}
```

### CSV Columns
```
name | rating | address | category | extractedAt
```

## Selector Reference

If Google Maps UI breaks, update in `config.js`:

```javascript
selectors: {
  searchInput: '[aria-label="Search on Google Maps"]',
  resultsPanel: '[role="main"] [role="feed"]',
  resultItem: '[role="option"]',
  // ... more selectors
}
```

**How to find new selectors:**
1. Open browser DevTools (F12)
2. Right-click element → Inspect
3. Copy the selector (class, ID, aria-label, role, etc.)
4. Update config.js

## Common Use Cases

### Once-a-week research
```bash
npm start -- "restaurants" -m 50
# Wait 7 days
npm start -- "restaurants" -m 50
```

### Compare locations
```bash
npm start -- "hospitals in Barcelona"
npm start -- "hospitals in Madrid"
npm start -- "hospitals in Valencia"
```

### Niche businesses
```bash
npm start -- "vegan restaurants in Paris" -m 40
npm start -- "3-star hotels" -m 35
npm start -- "yoga studios" -m 25
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Very few results | Broader search term, check Maps directly |
| CAPTCHA block | Wait 5-24 hours, increase delays |
| No results | Query not found, try nearby city |
| Timeout | Reduce maxResults or increase maxRuntimeMinutes |
| Selectors not working | Google Maps updated UI, inspect and update selectors |
| "npm not found" | Reinstall Node.js, restart Windows |
| Permission denied | Run Command Prompt as Administrator |

## Environment Setup (One-time)

```bash
# Install Node.js LTS from nodejs.org
# Then run once:

cd C:\path\to\scrape
npm install

# Now ready to use!
npm start -- "test query"
```

## Data Analysis

### Open results in Excel

1. Navigate to `results/` folder
2. Right-click CSV file
3. "Open with" → Excel
4. Use filters, sorting, charts

### Extract just names
```bash
# Requires jq tool (https://stedolan.github.io/jq/)
jq '.listings[].name' results/*.json
```

### Count results
```bash
# On Windows PowerShell
(Get-Content results/*.json | ConvertFrom-Json).listings.Count
```

## Safety Reminders

✅ **Safe:**
- 1 search per hour
- 50-100 results per run
- 2-5 second delays
- Occasional manual runs
- Personal research only

❌ **Unsafe:**
- 10+ searches per hour
- 1000+ results per run
- No delays, rapid clicking
- Automated 24/7 operation
- Selling or distributing data

---

## Quick Decision Tree

```
Want to scrape?
  ├─ Never used? → See SETUP.md
  ├─ First time? → npm install, then npm start
  ├─ Tweak timing? → Edit config.js
  ├─ Different query? → npm start -- "new query"
  ├─ More results? → npm start -- -q "query" -m 100
  ├─ Fewer results? → npm start -- -q "query" -m 20
  ├─ Results not showing? → Check results/ folder
  ├─ Script slow? → Normal, Google Maps loading
  ├─ Hit CAPTCHA? → Wait, increase delays, retry later
  ├─ Modify code? → Edit src/*.js files
  ├─ Understand code? → Read DEVELOPER.md
  └─ Need examples? → See EXAMPLES.md
```

## Keyboard Shortcuts

### In Command Prompt
- `Ctrl+C` → Stop script
- `Ctrl+A` → Select all text
- `Up Arrow` → Previous command
- `Tab` → Auto-complete
- `Ctrl+L` → Clear screen

### In Browser (during script)
- `F12` → Open DevTools
- `Ctrl+Shift+I` → Inspect element
- `Escape` → Close DevTools
- `Ctrl+W` → Close window (but script closes it)

## Git/Version Control (Optional)

```bash
# Initialize repo (one-time)
cd path\to\scrape
git init

# Check status
git status

# Commit your changes
git add .
git commit -m "Initial setup"

# Ignore generated files (already in .gitignore)
# - node_modules/
# - results/
# - *.csv, *.json
```

## Resources

- **Setup Help**: See `SETUP.md`
- **Usage Examples**: See `EXAMPLES.md`
- **Full Documentation**: See `README.md`
- **Developer Info**: See `DEVELOPER.md`
- **Playwright Docs**: https://playwright.dev/
- **Node.js Docs**: https://nodejs.org/docs/

---

## Version Info

- **Created**: December 2024
- **Version**: 1.0.0
- **Node.js**: 18+ LTS required
- **Playwright**: 1.40.0+
- **OS**: Windows, macOS, Linux

---

**Last Updated**: March 26, 2026

Keep it simple, keep it safe, keep it respectful. 🤝
