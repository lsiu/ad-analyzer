// popup.js - Popup script

document.addEventListener('DOMContentLoaded', function() {
  const refreshButton = document.getElementById('refresh');
  const statusDiv = document.getElementById('status');
  
  refreshButton.addEventListener('click', function() {
    // Send message to content script to refresh ad detection
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "highlightAds"}, function(response) {
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
});