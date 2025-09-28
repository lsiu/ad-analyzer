import React, { useState, useEffect } from 'react';

const OpenRTBPanel = () => {
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState([]);

  // Connect to background script to fetch bid data
  useEffect(() => {
    // Connect to background script via port
    const port = chrome.runtime.connect({ name: 'devtools' });

    // Request initial bid data
    port.postMessage({ type: 'getBidData' });

    // Listen for bid data from background script
    port.onMessage.addListener(function(response) {
      if (response && response.type === 'bidData') {
        // Process and update the state with requests and responses
        setRequests(response.data.requests);
        setResponses(response.data.responses);
      }
    });

    // Set up a periodic update to get fresh data
    const intervalId = setInterval(() => {
      port.postMessage({ type: 'getBidData' });
    }, 2000); // Update every 2 seconds

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

  // Function to extract bid price from request body (looking for any bid-related info)
  const extractBidInfoFromRequest = (requestBody) => {
    try {
      const reqObj = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
      const bidInfo = {
        hasImpressions: false,
        impressionCount: 0,
        hasBids: false,
        hasPriceInfo: false,
        bidPrices: []
      };

      if (reqObj && reqObj.imp) {
        bidInfo.hasImpressions = true;
        bidInfo.impressionCount = reqObj.imp.length;

        // Look for any bid-related information in impressions
        for (const imp of reqObj.imp) {
          if (imp.bidfloor) {
            bidInfo.hasPriceInfo = true;
            bidInfo.bidPrices.push(imp.bidfloor);
          }
        }
      }

      // Look for other OpenRTB specific fields
      if (reqObj.id) bidInfo.hasBids = true;

      return bidInfo;
    } catch (e) {
      console.error('Error parsing request for bid info:', e);
      return null;
    }
  };

  // Helper function to find matching responses for each request
  const getMatchingResponses = (requestUrl) => {
    return responses.filter(resp => resp.url === requestUrl);
  };

  return (
    <div id="container" style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 16 }}>
      <h2>OpenRTB Bid Requests & Responses (React)</h2>
      <div id="bids">
        {requests.map((req, i) => {
          const matchingResponses = getMatchingResponses(req.url);
          const bidInfo = extractBidInfoFromRequest(req.body);
          
          return (
            <div key={i} className="bid" style={{ borderBottom: '1px solid #ccc', marginBottom: 8, paddingBottom: 8 }}>
              <div>
                <strong>Request #{i + 1}</strong>
              </div>
              <div>
                URL: {req.url}
              </div>
              <div>
                Time: {new Date(req.time).toLocaleTimeString()}
              </div>
              
              {/* Expandable bid details */}
              <details style={{ marginBottom: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '4px 0' }}>
                Show Bid Details
              </summary>
              <div style={{ marginBottom: '8px', padding: '4px 8px', backgroundColor: '#f9f9f9', borderRadius: '3px' }}>
                <strong>Bid Info:</strong><br />
                {bidInfo && (
                <>
                  {bidInfo.hasImpressions && `Impressions: ${bidInfo.impressionCount}`}<br />
                  {bidInfo.bidPrices.length > 0 && `Bid Floors: ${bidInfo.bidPrices.map(p => `${p.toFixed(2)}`).join(', ')}`}
                </>
                )}
              </div>
              <div>
                <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
                {formatJson(req.body)}
                </pre>
              </div>
              </details>
              {matchingResponses.length > 0 && matchingResponses.filter((resp, j) => resp.requestId == req.requestId ).map((resp, j) => (
                <div key={j} className="response" style={{ color: '#007700', marginTop: '10px' }}>
                <strong>Response (requestId):{resp.requestId}:</strong><br />
                Status: {resp.statusCode}<br />
                Time: {new Date(resp.time).toLocaleTimeString()}<br />
                Response body: {resp.body}
                </div>
              ))}
            </div>
          );
        })}
        {requests.length === 0 && (
          <div>No OpenRTB bid requests detected yet. Visit a website that serves ads to see bid data.</div>
        )}
      </div>
    </div>
  );
};

export default OpenRTBPanel;