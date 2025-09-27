// js/modules/adHighlighter.js - Ad highlighting functionality

import adSelectors from './adSelectors.js';
import { isTradeDeskAd } from './adVerification.js';

// Function to highlight ads
export function highlightAds(root = document) {
  console.log('=== Ad Highlighter Run ===');
  
  // Remove existing highlights first
  const existingRedHighlights = root.querySelectorAll('.ad-highlighter-border');
  existingRedHighlights.forEach(el => {
    el.classList.remove('ad-highlighter-border');
  });
  
  const existingBlueHighlights = root.querySelectorAll('.ad-highlighter-trade-border');
  existingBlueHighlights.forEach(el => {
    el.classList.remove('ad-highlighter-trade-border');
  });
  
  console.log(`Removed ${existingRedHighlights.length} red highlights and ${existingBlueHighlights.length} blue highlights`);
  
  // Find and highlight ads
  const ads = new Set();
  const tradeDeskAds = new Set();
  
  adSelectors.forEach(selector => {
    try {
      const elements = root.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Selector "${selector}" matched ${elements.length} elements`);
      }
      
      elements.forEach(el => {
        if (el.closest('.ad-highlighter-border, .ad-highlighter-trade-border') !== null) {
          return; // Already highlighted
        }

        if (isTradeDeskAd(el)) {
          console.log(`Adding Trade Desk ad:`, el);
          tradeDeskAds.add(el);
        } else {
          ads.add(el);
        }
      });
    } catch (e) {
      console.debug('Invalid selector:', selector);
    }
  });

  root.querySelectorAll('iframe').forEach(iframe => {
    // Check if iframe src matches known ad networks
    if (ads.has(iframe) || tradeDeskAds.has(iframe)) {
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
      if (parent && parent.closest('.ad-highlighter-border, .ad-highlighter-trade-border') === null) {
        // Check if it's a The Trade Desk ad
        if (isTradeDeskAd(parent)) {
          console.log('Found Trade Desk "Advertisement" text element:', parent);
          tradeDeskAds.add(parent);
        } else {
          console.log('Found "Advertisement" text element:', parent);
          ads.add(parent);
        }
      }
    }
  });
  
  // Apply highlighting to all found ads
  ads.forEach(ad => {
    ad.classList.add('ad-highlighter-border');
    ad.querySelectorAll('.ad-highlighter-border').forEach(child => child.classList.remove('ad-highlighter-border'));
  });
  
  tradeDeskAds.forEach(ad => {
    ad.classList.add('ad-highlighter-trade-border');
    ad.querySelectorAll('.ad-highlighter-trade-border').forEach(child => child.classList.remove('ad-highlighter-trade-border'));
  });
  
  console.log(`Highlighted ${ads.size} regular ads and ${tradeDeskAds.size} Trade Desk ads on the page`);
  console.log('=== End Run ===');
}