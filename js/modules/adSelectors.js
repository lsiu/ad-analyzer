// js/modules/adSelectors.js - Ad selectors configuration

// More specific selectors to reduce false positives
const adSelectors = [
  // Google AdSense (more specific)
  '.adsbygoogle',
  '[data-ad-client]',
  '[data-ad-slot]',
  '[data-google-query-id]',
  'iframe[id^=google_ads]',
  
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
  '[id="google_ads_iframe*"]',
  
  // Social media ads
  'div[data-pagelet^="FeedUnit_"]', // Facebook feed ads
  'div[role="article"][data-testid="placementTracking"]', // Instagram sponsored posts
  
  // YouTube ads
  '.ytp-ad-module',
  
  // Twitter ads
  'div[data-testid="placementTracking"]',
  
  // LinkedIn ads
  'div[class*="ad-banner" i]',
  
  // Reddit ads
  'div[data-testid="ad"]',
  
  // Pinterest ads
  'div[data-test-id="ad"]',
  
  // TikTok ads
  'div[class*="tiktok-ads" i]', 
  
  // Standard ad sizes in more specific contexts
  'div[data-ad-width="300"][data-ad-height="250"]',
  'div[data-ad-width="728"][data-ad-height="90"]',
  'div[data-ad-width="160"][data-ad-height="600"]'
];

export default adSelectors;