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

The extension uses common CSS selectors to identify potential ad elements on web pages, including:
- Elements with "ad", "advert", or "sponsor" in their class or ID names
- Google AdSense elements
- DoubleClick ads
- Iframes from known ad networks
- Elements with ad-related data attributes

When an ad is detected, it's highlighted with a red border and a subtle pulsing animation.

## Manual Refresh

If ads aren't being detected properly, you can click the extension icon and use the "Refresh Ad Detection" button to manually trigger a scan.

## Customization

You can modify the highlighting style by editing `styles.css`. The animation and border properties can be adjusted to your preference.