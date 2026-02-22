import React, { useState, useEffect } from 'react';
import OpenRTBPanel from './OpenRTBPanel';

const PopupApp = () => {
  const [bidRequests, setBidRequests] = useState([]);
  const [bidResponses, setBidResponses] = useState([]);
  const [status, setStatus] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to refresh ad detection
  const handleRefreshAds = () => {
    setIsRefreshing(true);
    setStatus('');
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "highlightAds" }, function(response) {
        // Check for runtime errors
        if (chrome.runtime.lastError) {
          console.log("Runtime error:", chrome.runtime.lastError.message);
          setStatus("Error: " + chrome.runtime.lastError.message);
          setIsRefreshing(false);
          return;
        }
        
        if (response && response.status === "success") {
          setStatus("Ads refreshed!");
        } else {
          setStatus("Error refreshing ads");
        }
        setIsRefreshing(false);
      });
    });
  };

  // Function to fetch bid data from background script
  useEffect(() => {
    // Connect to background script via port
    const port = chrome.runtime.connect({ name: 'devtools' });

    // Request initial bid data
    const fetchBidData = () => {
      port.postMessage({ type: 'getBidData' });
    };

    // Initial fetch
    fetchBidData();

    // Listen for bid data from background script
    port.onMessage.addListener(function(response) {
      if (response && response.type === 'bidData') {
        setBidRequests(response.data.requests);
        setBidResponses(response.data.responses);
      }
    });

    // Set up a periodic update to get fresh data
    const intervalId = setInterval(() => {
      fetchBidData();
    }, 3000); // Update every 3 seconds

    // Clean up
    return () => {
      clearInterval(intervalId);
      port.disconnect();
    };
  }, []);

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif' 
    }}>
      <h1 style={{ fontSize: '18px', marginTop: 0, color: '#333' }}>Ad Highlighter</h1>
      <p>Ads on this page are highlighted with red borders.</p>
      
      <button 
        id="refresh" 
        onClick={handleRefreshAds}
        disabled={isRefreshing}
        style={{
          backgroundColor: isRefreshing ? '#cccccc' : '#4CAF50',
          border: 'none',
          color: 'white',
          padding: '10px 15px',
          textAlign: 'center',
          textDecoration: 'none',
          display: 'inline-block',
          fontSize: '16px',
          margin: '4px 2px',
          cursor: isRefreshing ? 'not-allowed' : 'pointer',
          borderRadius: '4px'
        }}
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Ad Detection'}
      </button>
      
      {status ? (
        <div 
          id="status" 
          className={status.includes("Error") ? "status error" : "status success"}
          style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: status.includes("Error") ? '#f2dede' : '#dff0d8',
            color: status.includes("Error") ? '#a94442' : '#3c763d',
            display: 'block'
          }}
        >
          {status}
        </div>
      ) : null}
      
      {/* OpenRTB Bid Information Section */}
      <OpenRTBPanel />
    </div>
  );
};

export default PopupApp;