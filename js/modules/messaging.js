// js/modules/messaging.js - Message handling between popup and content script

import { highlightAds } from './adHighlighter.js';

// Listen for messages from popup
export function setupMessageListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "highlightAds") {
      highlightAds();
      sendResponse({status: "success"});
    }
    // Return true to indicate asynchronous response
    return true;
  });
}