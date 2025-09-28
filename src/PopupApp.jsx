import React, { useState, useEffect } from 'react';

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

  const formatJson = (str) => {
    try {
      // Try to parse the JSON string and format it
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      // Return the original string if parsing fails
      return str;
    }
  };

  // Helper function to find matching responses for each request
  const getMatchingResponses = (requestUrl) => {
    return bidResponses.filter(resp => resp.url === requestUrl);
  };

  return (
    <div style={{ 
      width: '300px', 
      padding: '20px', 
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
      <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
        <h2 style={{ fontSize: '16px', margin: '0 0 10px 0', color: '#333' }}>OpenRTB Bid Activity</h2>
        
        <div style={{ fontSize: '14px' }}>
          <p><strong>Requests: {bidRequests.length}</strong></p>
          <p><strong>Responses: {bidResponses.length}</strong></p>
        </div>
        
        {bidRequests.length > 0 ? (
          <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
            {bidRequests.slice(0, 5).map((req, i) => {
              const matchingResponses = getMatchingResponses(req.url);
              return (
                <div 
                  key={i} 
                  className="bid" 
                  style={{ 
                    borderBottom: '1px solid #ccc', 
                    marginBottom: '8px', 
                    paddingBottom: '8px',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <strong>Request #{i + 1}</strong>
                  </div>
                  <div title={req.url}>
                    URL: {req.url.length > 30 ? req.url.substring(0, 30) + '...' : req.url}
                  </div>
                  <div>
                    Time: {new Date(req.time).toLocaleTimeString()}
                  </div>
                  {matchingResponses.length > 0 && matchingResponses.map((resp, j) => (
                    <div key={j} className="response" style={{ color: '#007700', marginTop: '4px' }}>
                      <strong>Response:</strong> Status {resp.statusCode}
                    </div>
                  ))}
                </div>
              );
            })}
            {bidRequests.length > 5 && (
              <p style={{ fontSize: '12px', color: '#666' }}>
                + {bidRequests.length - 5} more requests...
              </p>
            )}
          </div>
        ) : (
          <p style={{ fontSize: '12px', color: '#666', fontStyle: 'italic' }}>
            No OpenRTB bid requests detected yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default PopupApp;