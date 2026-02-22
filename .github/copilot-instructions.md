# Copilot Instructions for Ad Analyzer

## Overview
This project is a Chrome extension designed to analyze ads on web pages, highlighting them and capturing auction details for better understanding. It utilizes Jupyter Notebooks for data analysis and employs a modular architecture for maintainability.

## Architecture
- **Main Components**:
  - **Content Script**: `dist/content.js` - Handles interactions with web pages.
  - **Popup**: `src/popup.jsx` - User interface for the extension.
  - **Background Script**: `js/background.js` - Manages background tasks and events.
  - **OpenRTB Panel**: `src/openrtb_panel.jsx` - Displays auction details.

- **Data Flow**: The content script communicates with the background script to fetch and process ad data, which is then displayed in the popup and OpenRTB panel.

## Developer Workflows
- **Building the Project**:
  - Use `npm run build` to create a production build.
  - For development, use `npm run dev` or `npm run watch` to enable hot reloading.

- **Testing**:
  - Run tests with `npm run test-build` to ensure functionality.

- **Cleaning Up**:
  - Use `npm run clean` to remove the `dist` directory before rebuilding.

## Project Conventions
- **File Structure**: Follow the modular approach with separate directories for scripts, styles, and assets.
- **Naming Conventions**: Use camelCase for JavaScript files and PascalCase for React components.

## Integration Points
- **External Dependencies**: The project relies on Webpack for module bundling and Babel for transpilation.
- **Cross-Component Communication**: Use message passing between content scripts and background scripts for data exchange.

## Important Files
- **`package.json`**: Contains scripts and dependencies.
- **`webpack.config.js`**: Base configuration for Webpack.
- **`webpack.dev.js`** and **`webpack.prod.js`**: Environment-specific configurations.

## Additional Resources
- Refer to the README.md for a high-level overview of the project.
- Use Jupyter Notebooks in the `notebook/` directory for data analysis tasks.