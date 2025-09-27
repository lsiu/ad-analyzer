// devtools.js - Chrome DevTools extension entry point
chrome.devtools.panels.create(
  "OpenRTB Bids",
  "icons/icon16.png",
  "openrtb_devtools_panel.html",
  function(panel) {
    // Panel created callback - can set up event listeners here if needed
  }
);
