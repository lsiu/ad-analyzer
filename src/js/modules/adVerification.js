// js/modules/adVerification.js - Ad verification functions

// Helper function to check if an ad is from The Trade Desk
export function isTradeDeskAd(element) {
  // Check if element contains iframe from The Trade Desk
  const tradeDeskIframes = element.querySelectorAll('iframe[src*="adsrvr.org"], [src*="adsrvr.org"]');
  if (tradeDeskIframes.length > 0) {
    return true;
  }
  
  // Check if element has The Trade Desk specific attributes or classes
  // (Add any specific identifiers if known)
  
  return false;
}