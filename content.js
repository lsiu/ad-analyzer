// content.js - Content script to detect and highlight ads

// More specific selectors for ad elements to reduce false positives
const adSelectors = [
  // Google AdSense (highly specific)
  '[class*="adsbygoogle"]',
  
  // DoubleClick and other ad network iframes (highly specific)
  'iframe[src*="doubleclick.net"]',
  'iframe[src*="googlesyndication.com"]',
  'iframe[src*="googletagservices.com"]',
  'iframe[src*="amazon-adsystem.com"]',
  'iframe[src*="ads.pubmatic.com"]',
  'iframe[src*="adnxs.com"]',
  'iframe[src*="rubiconproject.com"]',
  
  // Common ad container classes (more specific)
  '[class*="ad-container"]',
  '[class*="ad_wrapper"]',
  '[class*="ad-banner"]',
  '[class*="ad-sidebar"]',
  '[class*="ad-header"]',
  '[class*="ad-footer"]',
  '[class*="advertisement"]',
  '[class*="sponsored-content"]',
  '[class*="sponsored-link"]',
  
  // Common ad container IDs (more specific)
  '[id*="ad-container"]',
  '[id*="ad-wrapper"]',
  '[id*="ad-banner"]',
  '[id*="advertisement"]',
  '[id*="google-ads"]',
  '[id*="sponsored"]',
  
  // Data attributes specific to ads
  '[data-ad-slot]',
  '[data-ad-format]',
  '[data-ad-client]',
  '[data-google-query-id]',
  
  // Common ad dimensions (very specific selectors)
  'div[style*="width: 300px"][style*="height: 250px"]',
  'div[style*="width: 728px"][style*="height: 90px"]',
  'div[style*="width: 160px"][style*="height: 600px"]',
  'div[style*="width: 300px"][style*="height: 600px"]',
  
  // Common ad placements
  '[class*="leaderboard"]',
  '[class*="billboard"]',
  '[class*="skyscraper"]',
  '[class*="rectangle"]'
];

// Blacklist of elements that are commonly mistaken for ads
const blacklistSelectors = [
  // Navigation elements
  'nav *',
  '[role="navigation"] *',
  '[class*="nav" i]',
  '[class*="menu" i]',
  
  // Header/footer elements
  'header *',
  'footer *',
  
  // Content elements that shouldn't be highlighted
  '[class*="read-more"]',
  '[class*="related"]',
  '[class*="breadcrumb"]',
  '[class*="pagination"]',
  '[class*="social"]',
  '[class*="share"]',
  '[class*="comment"]',
  '[class*="sidebar" i]:not([class*="ad" i])',
  '[class*="widget" i]:not([class*="ad" i])',
  
  // Common UI elements
  'button',
  'input',
  'select',
  'textarea',
  'label',
  
  // Content containers
  'article',
  'main',
  '[role="main"]',
  '[class*="content" i]:not([class*="ad" i])',
  '[class*="post" i]:not([class*="ad" i])',
  '[class*="article" i]:not([class*="ad" i])'
];

// Function to check if element is in blacklist
function isBlacklisted(element) {
  for (const selector of blacklistSelectors) {
    if (element.matches && element.matches(selector)) {
      return true;
    }
    if (element.closest && element.closest(selector)) {
      return true;
    }
  }
  return false;
}

// Function to check if element is likely an ad based on content
function isLikelyAd(element) {
  // Check for common ad text
  const text = element.textContent.toLowerCase();
  const adKeywords = [
    'advertisement', 'advertiser', 'sponsored', 'promotion',
    'promoted', 'banner ad', 'side ad', 'google ad'
  ];
  
  // Check if element has ad-like text
  for (const keyword of adKeywords) {
    if (text.includes(keyword)) {
      return true;
    }
  }
  
  // Check for common ad attributes
  if (element.hasAttribute('data-ad-client') || 
      element.hasAttribute('data-ad-slot') || 
      element.hasAttribute('data-google-query-id')) {
    return true;
  }
  
  // Check for iframes with ad URLs
  const iframes = element.querySelectorAll('iframe');
  const adDomains = [
    'doubleclick.net', 'googlesyndication.com', 'googletagservices.com',
    'amazon-adsystem.com', 'ads.pubmatic.com', 'adnxs.com', 'rubiconproject.com'
  ];
  
  for (const iframe of iframes) {
    for (const domain of adDomains) {
      if (iframe.src && iframe.src.includes(domain)) {
        return true;
      }
    }
  }
  
  return false;
}

// Function to highlight ads
function highlightAds() {
  // Remove existing highlights first
  const existingHighlights = document.querySelectorAll('.ad-highlighter-border');
  existingHighlights.forEach(el => {
    el.classList.remove('ad-highlighter-border');
  });
  
  // Find and highlight ads
  const ads = new Set(); // Use a Set to avoid duplicates
  
  adSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        // Skip elements that are too small
        const rect = el.getBoundingClientRect();
        if (rect.width < 50 || rect.height < 50) {
          return;
        }
        
        // Skip elements that are too large (likely content areas)
        if (rect.width > 1000 || rect.height > 1000) {
          return;
        }
        
        // Skip blacklisted elements
        if (isBlacklisted(el)) {
          return;
        }
        
        // Skip elements with a lot of text (likely content)
        const textLength = el.textContent.trim().length;
        if (textLength > 500 && !isLikelyAd(el)) {
          return;
        }
        
        // Skip elements that are likely navigation or UI components
        const childCount = el.childElementCount;
        if (childCount > 20 && !isLikelyAd(el)) {
          return;
        }
        
        // Additional filtering for elements with class/id containing "ad"
        // but are likely false positives
        const className = el.className || '';
        const id = el.id || '';
        const classAndId = (className + ' ' + id).toLowerCase();
        
        // Skip elements that are likely not ads despite matching selectors
        if (classAndId.includes('navigation') || 
            classAndId.includes('bread') || 
            classAndId.includes('social') ||
            classAndId.includes('related') ||
            classAndId.includes('comment')) {
          return;
        }
        
        ads.add(el);
      });
    } catch (e) {
      // Ignore invalid selectors
      console.debug('Invalid selector:', selector);
    }
  });
  
  // Apply highlighting to all found ads
  ads.forEach(ad => {
    ad.classList.add('ad-highlighter-border');
  });
  
  console.log(`Highlighted ${ads.size} ads on the page`);
}

// Run immediately when the script loads
highlightAds();

// Run again after a delay to catch dynamically loaded ads
setTimeout(highlightAds, 3000);

// Run periodically to catch ads loaded after page load
setInterval(highlightAds, 10000);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "highlightAds") {
    highlightAds();
    sendResponse({status: "success"});
  }
});