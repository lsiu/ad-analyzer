// content.js - Content script to detect and highlight ads

// More specific selectors to reduce false positives
const adSelectors = [
  // Google AdSense (more specific)
  '.adsbygoogle',
  '[data-ad-client]',
  '[data-ad-slot]',
  '[data-google-query-id]',
  
  // Common ad networks (exact matches)
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="amazon-adsystem.com"]',
  'iframe[src*="ads.pubmatic.com"]',
  'iframe[src*="adnxs.com"]',
  
  // The Trade Desk
  'iframe[src*="adsrvr.org"]',
  
  // Taboola and Outbrain (more specific)
  '[class*="taboola" i][class*="placement" i]',
  '[class*="outbrain" i][class*="widget" i]',
  '[data-ob-mark]',
  
  // More specific sponsored/advertisement indicators
  '[class*="sponsored-content" i]',
  '[class*="ad-container" i]',
  '[class*="ad-wrapper" i]',
  '[id*="ad-container" i]',
  '[id*="ad-wrapper" i]',
  
  // Common ad unit classes/ids
  '[class*="adunit" i]',
  '[id*="adunit" i]',
  '[class*="ad-box" i]',
  '[id*="ad-box" i]',
  
  // Standard ad sizes in more specific contexts
  'div[data-ad-width="300"][data-ad-height="250"]',
  'div[data-ad-width="728"][data-ad-height="90"]',
  'div[data-ad-width="160"][data-ad-height="600"]'
];

// Function to highlight ads
function highlightAds() {
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
            console.log(`Adding Trade Desk ad:`, el);
            tradeDeskAds.add(el);
          } else {
            console.log(`Adding regular ad:`, el);
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

// Helper function to verify if an element is actually an ad
function isAdElement(element) {
  // Basic size filtering
  const rect = element.getBoundingClientRect();
  if (rect.width < 20 || rect.height < 20) {
    return false;
  }
  
  if (rect.width > 2000 || rect.height > 2000) {
    return false;
  }
  
  // Skip obvious content elements
  if (element.matches('article, main, [role="main"]')) {
    return false;
  }
  
  // Skip navigation elements
  if (element.closest('nav, [role="navigation"]')) {
    return false;
  }
  
  // Skip header/footer elements
  if (element.closest('header, footer')) {
    return false;
  }
  
  // Check if element has ad-like characteristics
  const hasAdText = element.textContent && 
  (element.textContent.toLowerCase().includes('advertisement') ||
  element.textContent.toLowerCase().includes('sponsored'));
  
  // Check if element contains iframe from ad networks
  const adIframes = element.querySelectorAll(
    'iframe[src*="doubleclick.net"], iframe[src*="googlesyndication.com"], ' +
    'iframe[src*="amazon-adsystem.com"], iframe[src*="ads.pubmatic.com"], ' +
    'iframe[src*="adnxs.com"], iframe[src*="adsrvr.org"]'
  );
  
  // More specific ad verification:
  // 1. Has data attributes typical of ads
  const hasAdDataAttributes = element.hasAttribute('data-ad-slot') || 
                              element.hasAttribute('data-ad-client') ||
                              element.hasAttribute('data-google-query-id');
  
  // 2. Has common ad classes
  const className = element.className || '';
  const hasAdClasses = typeof className === 'string' && (
    /\bad-container\b/.test(className) ||
    /\bad-wrapper\b/.test(className) ||
    /\badsbygoogle\b/.test(className)
  );
  
  // Element is likely an ad if:
  // - It has ad-specific data attributes, OR
  // - It contains ad iframes, OR
  // - It has ad-specific classes, OR
  // - It contains ad text and has appropriate dimensions
  isAd = hasAdDataAttributes || 
         adIframes.length > 0 || 
         hasAdClasses || 
         (hasAdText && rect.width > 100 && rect.height > 50);
  if (isAd) {
    console.log(
      'isAdElement true for element:',
      element,
      {
      hasAdDataAttributes,
      adIframesCount: adIframes.length,
      hasAdClasses,
      hasAdText,
      rect: { width: rect.width, height: rect.height }
      }
    );
  }
  return isAd;
}

// Helper function to check if an ad is from The Trade Desk
function isTradeDeskAd(element) {
  // Check if element contains iframe from The Trade Desk
  const tradeDeskIframes = element.querySelectorAll('iframe[src*="adsrvr.org"]');
  if (tradeDeskIframes.length > 0) {
    return true;
  }
  
  // Check if element has The Trade Desk specific attributes or classes
  // (Add any specific identifiers if known)
  
  return false;
}

// Run immediately when the script loads
highlightAds();

// Run again after a delay to catch dynamically loaded ads
setTimeout(highlightAds, 2000);

// Run periodically to catch ads loaded after page load
setInterval(highlightAds, 5000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightAds") {
    highlightAds();
    sendResponse({status: "success"});
  }
  // Return true to indicate asynchronous response
  return true;
});