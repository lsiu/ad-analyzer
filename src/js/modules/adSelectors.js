// js/modules/adSelectors.js - Ad selectors configuration

// More specific selectors to reduce false positives
const adSelectors = [
  // Google AdSense (more specific)
  'iframe[id^=google_ads]',

  // Common ad networks (exact matches)
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="googleadservices.com"]',
  'iframe[src*="amazon-adsystem.com"]',
  'iframe[src*="ads.pubmatic.com"]',
  'iframe[src*="adnxs.com"]',

  // Reddit ads
  'shreddit-ad-post',

  // Taboola
  '.trc_related_container',
];

export default adSelectors;