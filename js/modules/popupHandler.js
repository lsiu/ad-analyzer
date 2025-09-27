// js/modules/popupHandler.js - Popup UI handling

export function refreshAds() {
  const refreshButton = document.getElementById('refresh');
  const statusDiv = document.getElementById('status');
  
  if (refreshButton) {
    refreshButton.addEventListener('click', function() {
      // Send message to content script to refresh ad detection
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "highlightAds"}, function(response) {
          // Check for runtime errors
          if (chrome.runtime.lastError) {
            console.log("Runtime error:", chrome.runtime.lastError.message);
            statusDiv.textContent = "Error: " + chrome.runtime.lastError.message;
            statusDiv.className = "status error";
            return;
          }
          
          if (response && response.status === "success") {
            statusDiv.textContent = "Ads refreshed!";
            statusDiv.className = "status success";
          } else {
            statusDiv.textContent = "Error refreshing ads";
            statusDiv.className = "status error";
          }
        });
      });
    });
  }
}