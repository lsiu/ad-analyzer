# Ad Analyzer Project Documentation

## Project Overview

The Ad Analyzer is a Chrome extension (Manifest V3) designed to capture and analyze ad bidding traffic on web pages. It combines real-time ad detection and highlighting with OpenRTB bid request/response monitoring to provide insights into the programmatic advertising ecosystem. The project also includes Jupyter notebooks for deeper analysis of captured bid data.

## Architecture

The project follows a typical Chrome extension architecture with all source code organized under `src/`.

### Core Components

- **Content Script (`src/js/content.js`)**: Runs on web pages to detect and highlight ads
  - Uses `src/js/modules/adScheduler.js` for periodic detection
  - Uses `src/js/modules/messaging.js` for popup communication
  - Uses `src/js/modules/adHighlighter.js` for DOM manipulation
  - Uses `src/js/modules/adSelectors.js` for ad element identification
  - Uses `src/js/modules/adVerification.js` for The Trade Desk ad detection

- **Background Script (`src/js/background.js`)**: Monitors OpenRTB bid requests using the Chrome debugger API
  - Attaches to tabs to capture network traffic
  - Identifies OpenRTB-compliant bid requests based on JSON structure (`id` and `imp` fields)
  - Tracks bid request/response pairs using `requestId`
  - Updates badge counter with detected bid requests
  - Exposes bid data via long-lived port connection

- **Popup UI (`src/jsx/popup.jsx`, `src/jsx/PopupApp.jsx`)**: React-based interface for user interaction
  - Displays ad highlighting controls
  - Includes OpenRTB panel for bid data display
  - Allows refreshing ad detection on current page

- **OpenRTB Panel (`src/jsx/openrtb_panel.jsx`, `src/jsx/OpenRTBPanel.jsx`)**: Detailed bid analysis UI
  - Displays bid requests and responses in expandable format
  - Extracts bid prices, impression counts, and floor prices
  - Provides export functionality (JSON) for requests, responses, or all data
  - Supports clearing collected bid data

- **DevTools Integration (`openrtb_devtools.html`, `openrtb_devtools.js`)**: Chrome DevTools panel for advanced analysis

### Styles (`src/jsx/styles.css`)
- `.ad-highlighter-border`: Red dashed border for regular ads
- `.ad-highlighter-trade-border`: Blue dashed border for The Trade Desk ads
- Includes subtle pulse animations for visibility

## Building and Running

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension in development mode:**
   ```bash
   npm run dev
   ```

3. **Watch for changes during development:**
   ```bash
   npm run watch
   ```

### Production Build

```bash
npm run build
```

### Package Distribution

Create a distributable ZIP file:
```bash
npm run package
```

### Manual Installation in Chrome

1. Build the project: `npm run build`
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the `dist` directory

## Key Features

### Ad Highlighting
- Automatically detects and highlights ads on web pages with red borders
- Differentiates between regular ads and The Trade Desk ads (highlighted in blue)
- Uses periodic detection to refresh ad identification
- Supports iframe traversal for nested ads
- Detects ads by:
  - Known ad network iframes (Google, Amazon, DoubleClick, etc.)
  - The Trade Desk domains (`adsrvr.org`)
  - Reddit ad posts (`shreddit-ad-post`)
  - Taboola containers (`.trc_related_container`)
  - Elements containing "Advertisement" text

### OpenRTB Monitoring
- Captures bid requests and responses using Chrome's debugger API (Network domain)
- Identifies OpenRTB-compliant bid requests based on JSON structure
- Tracks bid request/response pairs by `requestId`
- Displays bid data in the popup UI with expandable details
- Updates badge counter with the number of detected bid requests
- Extracts bid information:
  - Request: impression count, bid floors
  - Response: bid count, winning bid prices

### Data Export
- Export bid data as JSON files for external analysis
- Separate export options for requests, responses, or all data combined
- Clear data functionality to reset collected bid information

### Jupyter Notebook Analysis
- Located in `notebook/analyze_bids.ipynb`
- Analyzes bid request/response pairs
- Extracts placement IDs from multiple fields:
  - `imp.ext.gpid` - Global Placement ID
  - `imp.tagid` - Tag ID
  - `imp.ext.data.pbadslot` - Publisher Ad Slot
  - `imp.id` - Impression ID
- Extracts demand source from `nurl`, `lurl`, or `adm` fields
- Generates DataFrames for bid analysis using pandas

## Development Conventions

### Code Structure
```
/adAnalyzer/
├── src/                        # All source code
│   ├── js/                     # JavaScript modules
│   │   ├── content.js          # Content script entry point
│   │   ├── background.js       # Background script
│   │   └── modules/            # Content script modules
│   │       ├── adHighlighter.js
│   │       ├── adScheduler.js
│   │       ├── adSelectors.js
│   │       ├── adVerification.js
│   │       └── messaging.js
│   ├── jsx/                    # React components and styles
│   │   ├── popup.jsx           # Popup UI entry point
│   │   ├── PopupApp.jsx        # Main popup component
│   │   ├── openrtb_panel.jsx   # DevTools panel entry point
│   │   ├── OpenRTBPanel.jsx    # OpenRTB bid display component
│   │   └── styles.css          # Ad highlighting styles
│   ├── icons/                  # Extension icons (16, 48, 128)
│   ├── manifest.json           # Chrome extension manifest
│   ├── popup.html              # Popup HTML template
│   ├── openrtb_panel.html      # OpenRTB panel HTML template
│   ├── openrtb_devtools.html   # DevTools HTML template
│   └── openrtb_devtools.js     # DevTools script
├── notebook/                   # Jupyter notebooks for analysis
│   ├── src/
│   │   └── bid_analysis.py     # Python analysis utilities
│   ├── test/
│   └── analyze_bids.ipynb
├── dist/                       # Build output directory
├── webpack*.js                 # Webpack configurations
└── package.json                # Project dependencies and scripts
```

### Build System
- **Webpack** for bundling and asset management
  - `webpack.config.js`: Base configuration
  - `webpack.dev.js`: Development configuration
  - `webpack.prod.js`: Production configuration
- **Babel** for transpiling modern JavaScript/JSX (`.babelrc`)
- Entry points: `content`, `popup`, `background`, `openrtb_panel`

### Chrome Extension Manifest (V3)
- **Permissions**: `activeTab`, `webRequest`, `debugger`
- **Host Permissions**: `<all_urls>`
- **Components**:
  - Background service worker: `background.js`
  - Content scripts: `content.js`, `styles.css`
  - DevTools page: `openrtb_devtools.html`
  - Popup: `popup.html`

### React Components
- Uses React 19 with functional components and hooks
- `createRoot` API for rendering
- Communicates with background script via `chrome.runtime.connect()` port

### Python Analysis
- Uses pandas for data manipulation
- Jupyter notebook for interactive analysis
- Bid analysis utilities in `notebook/src/bid_analysis.py`

## Testing and Analysis Scripts

The project includes automated testing scripts (Puppeteer-based):
- `check_prebid_gpt.js`: Checks websites for Prebid.js and Google Publisher Tag usage
- Category-specific scripts for news, tech, entertainment, gaming, and newspaper sites
- Playwright integration for advanced testing scenarios

## Docker Support

The project includes a `docker-compose.yml` for setting up a development environment with:
- Node.js 20 base image
- Python 3 with Jupyter notebook support
- pandas for data analysis
- Qwen Code CLI integration

## npm Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run build` | Production build using webpack |
| `npm run dev` | Development build |
| `npm run watch` | Development build with watch mode |
| `npm run clean` | Clean dist directory (via rimraf) |
| `npm run package` | Build and create distributable ZIP |
