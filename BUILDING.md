# Build Process

This extension now uses webpack to bundle and optimize the JavaScript files.

## Project Structure

```
src/
├── js/                 # Source JavaScript files
│   ├── content.js      # Main content script entry point
│   ├── popup.js        # Popup script entry point
│   └── modules/        # Individual modules
│       ├── adSelectors.js
│       ├── adVerification.js
│       ├── adHighlighter.js
│       ├── adScheduler.js
│       ├── messaging.js
│       └── popupHandler.js
├── dist/               # Built extension files (generated)
├── webpack.config.js   # Base webpack configuration
├── webpack.dev.js      # Development webpack configuration
├── webpack.prod.js     # Production webpack configuration
├── build-extension.js  # Extension packaging script
└── ...                 # Other extension files
```

## Available Scripts

- `npm run build` - Builds the extension for production (minified with source maps)
- `npm run dev` - Builds the extension for development (with source maps)
- `npm run watch` - Watches for changes and rebuilds automatically (with source maps)
- `npm run package` - Creates a zip file for distribution

## Development Workflow

1. Make changes to files in the `js/` directory
2. Run `npm run build` to create a production build
3. Load the extension from the `dist/` directory in Chrome

## Source Maps

Both development and production builds now generate source maps to enable proper debugging in Chrome DevTools. The `npm run watch` command also generates source maps for real-time debugging during development.

## Module Organization

The content script functionality has been split into logical modules:

- `adSelectors.js` - Contains all ad selector patterns
- `adVerification.js` - Functions to verify if elements are actually ads
- `adHighlighter.js` - Core ad highlighting functionality
- `adScheduler.js` - Timing and scheduling for periodic ad detection
- `messaging.js` - Chrome extension message handling
- `popupHandler.js` - Popup UI interaction handling

This modular approach makes the code more maintainable and easier to test.