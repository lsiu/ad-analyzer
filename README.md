# Ad Highlighter Chrome Extension

This Chrome extension highlights ads on web pages with a red border to make them easily identifiable.

## Features

- Automatically detects and highlights ads with a red border
- Works on most websites
- Includes a popup interface to manually refresh ad detection
- Lightweight and non-intrusive

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will be installed and ready to use

## How It Works

The extension uses more specific CSS selectors and verification methods to identify ad elements on web pages, including:
- Google AdSense elements (using specific classes like "adsbygoogle")
- DoubleClick ads and other known ad network iframes
- Taboola and Outbrain widgets
- The Trade Desk ads (adsrvr.org domain)
- Elements with ad-related data attributes (data-ad-slot, data-ad-client)
- Elements containing "Advertisement" or "Sponsored" text with appropriate dimensions

The extension now uses a verification function to reduce false positives by checking multiple ad indicators before highlighting an element.

## Color Coding

Ads are highlighted with different colors based on their source:
- Regular ads: Red border with subtle pulsing animation
- The Trade Desk ads: Blue border with subtle pulsing animation

## Manual Refresh

If ads aren't being detected properly, you can click the extension icon and use the "Refresh Ad Detection" button to manually trigger a scan.

## Customization

You can modify the highlighting style by editing `styles.css`. The animation and border properties can be adjusted to your preference.

## Building the Extension

This extension now uses webpack to bundle and optimize the JavaScript files. For more information on the build process, see [BUILDING.md](BUILDING.md).

### Quick Build Commands

- `npm run build` - Builds the extension for production (minified)
- `npm run dev` - Builds the extension for development (with source maps)
- `npm run watch` - Watches for changes and rebuilds automatically
- `npm run package` - Creates a zip file for distribution

All bundled files are output to the `dist/` directory, which can be loaded directly into Chrome.