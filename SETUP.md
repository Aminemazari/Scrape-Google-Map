# Setup Guide

Complete step-by-step installation and first-run guide for Windows.

## Prerequisites

- **Windows 10 or later**
- **Administrator privileges** (may be needed for Playwright)
- **Internet connection**
- **~500 MB disk space** (for Node.js + Playwright + Chromium)

## Step 1: Install Node.js LTS

### Download
1. Visit [nodejs.org](https://nodejs.org/)
2. Click the **LTS (Long Term Support)** button
3. Download the Windows installer (*.msi file)

### Install
1. Run the installer (.msi)
2. Follow the installation wizard
3. ✅ Check both options:
   - "Add to PATH"
   - "Automatically install necessary tools"
4. Click **Install**
5. Click **Finish**

### Verify Installation

Open Command Prompt (Win + R, type `cmd`, press Enter):

```cmd
node --version
npm --version
```

You should see version numbers like:
```
v20.10.0
9.8.1
```

## Step 2: Navigate to Project Folder

```cmd
cd "C:\Users\YourUsername\OneDrive\Desktop\vibe coded project\scrape"
```

**Note**: Replace `YourUsername` with your actual Windows username.

### Quick Method
1. Open File Explorer
2. Navigate to the scrape folder
3. Right-click in empty space
4. Select "Open in Terminal" or "Open command window here"

## Step 3: Install Dependencies

```cmd
npm install
```

This downloads and installs:
- **Playwright** (~100 MB)
- **Chromium browser** (~300 MB)

Takes 2-5 minutes depending on internet speed.

**Output should include:**
```
added XX packages in XXs
```

## Step 4: Verify Installation

```cmd
npm start -- --help
```

You should see the help message with examples.

## Step 5: Run Your First Search

```cmd
npm start -- "restaurants near me"
```

The script will:
1. Launch a browser window (Chromium)
2. Navigate to Google Maps
3. Search for "restaurants near me"
4. Scroll and collect results
5. Close the browser
6. Save results to `results/` folder

**First run takes 5-10 minutes** (includes browser startup).

## Step 6: Find Your Results

```cmd
explorer results
```

Or navigate to: `vibe coded project\scrape\results\`

You'll see:
- `2024-12-15-1430_google_maps_listings.json` (detailed data)
- `2024-12-15-1430_google_maps_listings.csv` (spreadsheet format)

Open CSV in Excel or Google Sheets for easy viewing.

---

## Troubleshooting Installation

### Issue: "npm: command not found"

**Solution**: Node.js not in PATH
1. Uninstall Node.js
2. Restart Windows
3. Reinstall Node.js (ensure "Add to PATH" is checked)
4. Restart Windows again

### Issue: "EACCES: permission denied"

**Solution**: Run Command Prompt as Administrator
1. Press Win + R
2. Type `cmd`
3. Press Ctrl + Shift + Enter (opens as admin)
4. Run `npm install` again

### Issue: "ERR! Code ENOENT"

**Solution**: Ensure you're in the correct folder
```cmd
# Verify you're in the right place
dir  # Should show package.json, src/, etc.

# If not, navigate to the folder
cd C:\Users\YourUsername\OneDrive\Desktop\vibe coded project\scrape
```

### Issue: Chromium download fails

**Solution**: Check internet connection
1. Ensure you have internet access
2. Try disabling VPN/proxy
3. Try installing Playwright separately:
   ```cmd
   npx playwright install chromium
   ```

### Issue: "Cannot find module 'playwright'"

**Solution**: Reinstall dependencies
```cmd
rm -r node_modules
npm install
```

---

## First Run Walkthrough

### 1. Open Command Prompt
```cmd
cd C:\Users\YourUsername\OneDrive\Desktop\vibe coded project\scrape
```

### 2. Run Script
```cmd
npm start -- "coffee shops in Barcelona"
```

### 3. Watch the Browser
A Chromium window will appear showing:
- ✅ Google Maps loads
- ✅ Search input gets focused
- ✅ Query typed and submitted
- ✅ Results panel appears
- ✅ Browser scrolls gradually
- ✅ Results extracted
- ✅ Browser closes

### 4. Check Results
```cmd
explorer results
```

Open the .csv file in Excel:
- Column A: Business names
- Column B: Ratings
- Column C: Addresses
- Column D: Categories

---

## Common Customizations

### Run with Different Query

```cmd
npm start -- "hotels in Paris"
npm start -- "gyms" -m 50
```

### Modify Configuration

Edit `src\config.js`:

```javascript
// Make delays longer (more respectful)
timing: {
  actionDelayMin: 3000,    // 3-5 seconds
  actionDelayMax: 5000,
}

// Collect fewer results (faster)
limits: {
  maxResults: 30,          // Only 30 results
}
```

### Slow Mode (Maximum Respect)

```javascript
// In src\config.js
timing: {
  actionDelayMin: 5000,    // 5-8 seconds (very slow!)
  actionDelayMax: 8000,
  scrollDelayMin: 3000,
  scrollDelayMax: 5000,
}
limits: {
  maxResults: 20,
  maxScrolls: 8,
}
```

Then run:
```cmd
npm start
```

---

## What Each File Does

| File | Purpose |
|------|---------|
| `package.json` | Lists dependencies (Playwright) |
| `src/index.js` | Main entry point, CLI interface |
| `src/config.js` | Configuration (delays, limits, selectors) |
| `src/scraper.js` | Core scraping logic with Playwright |
| `src/exporter.js` | Saves to JSON and CSV |
| `src/utils.js` | Helper functions (logging, delays) |
| `README.md` | Full documentation |
| `EXAMPLES.md` | Usage examples |
| `results/` | Output folder (auto-created) |

---

## Getting Help

### Script shows error
1. Check **src/config.js** - increase timeouts
2. Check network - ensure Google Maps loads normally
3. Try different search query - maybe results are limited
4. Check for CAPTCHA - wait a few hours before retrying

### Need to modify selectors
Google Maps UI changes occasionally. If selectors break:
1. Open browser dev tools (F12)
2. Search for elements
3. Update selectors in **src/config.js**

### Questions about data usage
See **README.md** for ethics and Terms of Service compliance.

---

## What's Next?

### Option 1: Run Multiple Searches
```cmd
npm start -- "restaurants"
REM Wait 10 minutes

npm start -- "cafes"
REM Wait 10 minutes

npm start -- "hotels"
```

Saves three files with different data.

### Option 2: Analyze Results
Open CSV files in Google Sheets and:
- Sort by rating
- Filter by category
- Create charts
- Find patterns

### Option 3: Integration
Use JSON output with other tools:
```cmd
# Extract just names (requires jq tool)
jq '.listings[].name' results/*.json > names.txt

# Use in Python
# Just parse the JSON file in your Python script
```

---

## Performance Tips

- **First run is slower** - Chromium downloads and starts (5-10 min)
- **Subsequent runs are faster** - Browser cached (3-5 min)
- **More results = longer time** - 100 results takes ~10 min
- **Large cities = longer time** - More scrolling needed
- **Close other programs** - Frees up RAM for smooth operation

---

## Security & Safety

✅ **What this script does:**
- Opens a public browser window
- Navigates to public Google Maps
- Collects visible, public information
- Saves to your computer

✅ **What this script does NOT do:**
- Bypass authentication or logins
- Access private user data
- Violate Terms of Service
- Perform aggressive automation
- Store or transmit data anywhere

**Safe to use for personal research!**

---

## Next Steps

1. ✅ Install Node.js
2. ✅ Run `npm install`
3. ✅ Test with `npm start -- "restaurants"`
4. ✅ Check results in `results/` folder
5. ✅ Customize `src/config.js` as needed
6. ✅ Read `EXAMPLES.md` for more use cases

**Happy researching! 🚀**
