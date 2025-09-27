// js/modules/adHighlighter.js - Ad highlighting functionality

import adSelectors from './adSelectors.js';
import { isAdElement, isTradeDeskAd } from './adVerification.js';

// Function to highlight ads
export function highlightAds() {
  console.log('=== Ad Highlighter Run ===');
  
  // Remove existing highlights first
  const existingRedHighlights = document.querySelectorAll('.ad-highlighter-border');
  existingRedHighlights.forEach(el => {
    el.classList.remove('ad-highlighter-border');
  });
  
  const existingBlueHighlights = document.querySelectorAll('.ad-highlighter-trade-border');
  existingBlueHighlights.forEach(el => {
    el.classList.remove('ad-highlighter-trade-border');
  });
  
  console.log(`Removed ${existingRedHighlights.length} red highlights and ${existingBlueHighlights.length} blue highlights`);
  
  // Find and highlight ads
  const ads = new Set();
  const tradeDeskAds = new Set();
  
  adSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        console.log(`Selector "${selector}" matched ${elements.length} elements`);
      }
      
      elements.forEach(el => {
        // Verify it's actually an ad before highlighting
        if (isAdElement(el)) {
          // Check if it's a The Trade Desk ad
          if (isTradeDeskAd(el)) {
            // console.log(`Adding Trade Desk ad:`, el);
            tradeDeskAds.add(el);
          } else {
            // console.log(`Adding regular ad:`, el);
            ads.add(el);
          }
        }
      });
    } catch (e) {
      console.debug('Invalid selector:', selector);
    }
  });
  
  // Special case: Look for elements containing "Advertisement" text
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.textContent && el.textContent.trim().toLowerCase() === 'advertisement') {
      const parent = el.parentElement;
      if (parent && isAdElement(parent)) {
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
  });
  
  tradeDeskAds.forEach(ad => {
    ad.classList.add('ad-highlighter-trade-border');
  });
  
  console.log(`Highlighted ${ads.size} regular ads and ${tradeDeskAds.size} Trade Desk ads on the page`);
  console.log('=== End Run ===');
}