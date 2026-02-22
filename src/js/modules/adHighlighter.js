// js/modules/adHighlighter.js - Ad highlighting functionality

import adSelectors from './adSelectors.js';
import { HIGHLIGHT_CLASS, STYLE_ID, highlightStyles } from './highlightStyles.js';
import { log, debug } from './logger.js';

// Inject highlight styles into a document
function injectStyles(doc) {
  if (!doc) return;

  // Check if styles already injected
  if (doc.getElementById(STYLE_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = highlightStyles;

  try {
    (doc.head || doc.documentElement).appendChild(style);
  } catch (e) {
    // Ignore injection errors
  }
}

// Function to highlight ads
export function highlightAds(root = document) {
  log('=== Ad Highlighter Run ===');

  // Inject styles into main document
  injectStyles(root);

  // Remove existing highlights
  const existingHighlights = root.querySelectorAll(`.${HIGHLIGHT_CLASS}`);
  existingHighlights.forEach(el => {
    el.classList.remove(HIGHLIGHT_CLASS);
  });

  log(`Removed ${existingHighlights.length} highlights`);

  // Find and highlight ads
  const ads = new Set();

  adSelectors.forEach(selector => {
    try {
      const elements = root.querySelectorAll(selector);
      if (elements.length > 0) {
        log(`Selector "${selector}" matched ${elements.length} elements`);
      }

      elements.forEach(el => {
        if (el.closest(`.${HIGHLIGHT_CLASS}`) !== null) {
          return; // Already highlighted
        }
        ads.add(el);
      });
    } catch (e) {
      debug('Invalid selector:', selector);
    }
  });

  // Traverse iframes for nested ads
  root.querySelectorAll('iframe').forEach(iframe => {
    if (ads.has(iframe)) {
      return; // Already added
    }

    try {
      const iframeSrc = iframe.src;
      const pageOrigin = window.location.origin;
      const link = document.createElement('a');
      link.href = iframeSrc;
      if (link.origin === pageOrigin) {
        // Same-origin iframe - inject styles and highlight
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        injectStyles(iframeDoc);
        highlightAds(iframeDoc);
      }
    } catch (error) {
      // Ignore cross-origin iframes
    }
  });

  // Special case: Look for elements containing "Advertisement" text
  const allElements = root.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.textContent && el.textContent.trim().toLowerCase() === 'advertisement') {
      const parent = el.parentElement;
      if (parent && parent.closest(`.${HIGHLIGHT_CLASS}`) === null) {
        log('Found "Advertisement" text element:', parent);
        ads.add(parent);
      }
    }
  });

  // Apply highlighting to all found ads
  ads.forEach(ad => {
    ad.classList.add(HIGHLIGHT_CLASS);
  });

  log(`Highlighted ${ads.size} ads on the page`);
  log('=== End Run ===');
}
