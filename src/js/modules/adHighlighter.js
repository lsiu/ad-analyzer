// js/modules/adHighlighter.js - Ad highlighting functionality

import adSelectors from './adSelectors.js';

// Function to highlight ads
export function highlightAds(root = document) {
  console.log('=== Ad Highlighter Run ===');

  // Remove existing highlights
  const existingHighlights = root.querySelectorAll('.ad-highlighter-border');
  existingHighlights.forEach(el => {
    el.classList.remove('ad-highlighter-border');
  });

  console.log(`Removed ${existingHighlights.length} highlights`);

  // Find and highlight ads
  const ads = new Set();

  adSelectors.forEach(selector => {
    try {
      const elements = root.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Selector "${selector}" matched ${elements.length} elements`);
      }

      elements.forEach(el => {
        if (el.closest('.ad-highlighter-border') !== null) {
          return; // Already highlighted
        }
        ads.add(el);
      });
    } catch (e) {
      console.debug('Invalid selector:', selector);
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
        highlightAds(iframe.contentDocument || iframe.contentWindow.document);
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
      if (parent && parent.closest('.ad-highlighter-border') === null) {
        console.log('Found "Advertisement" text element:', parent);
        ads.add(parent);
      }
    }
  });

  // Apply highlighting to all found ads
  ads.forEach(ad => {
    ad.classList.add('ad-highlighter-border');
    ad.querySelectorAll('.ad-highlighter-border').forEach(child => child.classList.remove('ad-highlighter-border'));
  });

  console.log(`Highlighted ${ads.size} ads on the page`);
  console.log('=== End Run ===');
}
