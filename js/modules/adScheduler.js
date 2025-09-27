// js/modules/adScheduler.js - Scheduling for ad detection

import { highlightAds } from './adHighlighter.js';

let intervalId;

// Run immediately when the script loads
highlightAds();

// Run again after a delay to catch dynamically loaded ads
setTimeout(highlightAds, 2000);

// Run periodically to catch ads loaded after page load
export function startPeriodicDetection() {
  intervalId = setInterval(highlightAds, 5000);
}

// Stop periodic detection
export function stopPeriodicDetection() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Export the interval ID for external management if needed
export { intervalId };