// js/modules/adVerification.js - Ad verification functions

// Helper function to verify if an element is actually an ad
export function isAdElement(element) {
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

  if (element.querySelectorAll('.ad-highlighter-border, .ad-highlighter-trade-border').length > 0) {
    return false; // Already highlighted
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

  const adsContainers = element.querySelectorAll('.ads-column-container');
  
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
    /\badsbygoogle\b/.test(className) ||
    /\bsponsored-content\b/.test(className) ||
    /\badunit\b/.test(className) ||
    /\bad-box\b/.test(className) ||
    /\bad-banner\b/.test(className) ||
    /\bads-column-container\b/.test(className)
  );
  
  // Element is likely an ad if:
  // - It has ad-specific data attributes, OR
  // - It contains ad iframes, OR
  // - It has ad-specific classes, OR
  // - It contains ad text and has appropriate dimensions
  const isAd = hasAdDataAttributes || 
         adIframes.length > 0 || 
         hasAdClasses || 
         adsContainers.length > 0 ||
         (hasAdText && rect.width > 100 && rect.height > 50);
         
  // if (isAd) {
    // console.log(
    //   'isAdElement true for element:',
    //   element,
    //   {
    //   hasAdDataAttributes,
    //   adIframesCount: adIframes.length,
    //   hasAdClasses,
    //   hasAdText,
    //   rect: { width: rect.width, height: rect.height }
    //   }
    // );
  // }
  return isAd;
}

// Helper function to check if an ad is from The Trade Desk
export function isTradeDeskAd(element) {
  // Check if element contains iframe from The Trade Desk
  const tradeDeskIframes = element.querySelectorAll('iframe[src*="adsrvr.org"]');
  if (tradeDeskIframes.length > 0) {
    return true;
  }
  
  // Check if element has The Trade Desk specific attributes or classes
  // (Add any specific identifiers if known)
  
  return false;
}