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
            bidInfo.bidPrices.push({price: imp.bidfloor, currency: imp.bidfloorcur});
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
  const getMatchingResponse = (requestId) => {
    const matchResponses = responses.filter(resp => resp.requestId === requestId)
    if (matchResponses.length > 1) {
      console.warn(`Multiple responses found for requestId ${requestId}`);
      return matchResponses[0]
    } else if (matchResponses.length === 1) {
      return matchResponses[0];
    }
    return null;
  };

  const extractBidInfoFromResponse = (responseBody) => {
    try {
      const respObj = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
      const bidInfo = { hasBids: false, bidCount: 0, bidPrices: [] };

      if (respObj && respObj.seatbid) {
        bidInfo.hasBids = true;
        bidInfo.bidCount = respObj.seatbid.reduce((count, seat) => count + (seat.bid ? seat.bid.length : 0), 0);
        for (const seat of respObj.seatbid) {
          if (seat.bid) {
            for (const bid of seat.bid) {
              if (bid.price) {
                bidInfo.bidPrices.push(bid.price);
              }
            }
          }
        }
      }

      return bidInfo;
    } catch (e) {
      console.error('Error parsing response for bid info:', e);
      return null;
    }
  };

  // Export functions
  const exportAllData = () => {
    const data = {
      requests: requests,
      responses: responses,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openrtb-bid-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportRequests = () => {
    const data = {
      requests: requests,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openrtb-bid-requests-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportResponses = () => {
    const data = {
      responses: responses,
      exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `openrtb-bid-responses-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="container" style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 16 }}>
      <h2>OpenRTB Bid Requests & Responses (React)</h2>
      
      {/* Export buttons */}
      <div style={{ marginBottom: '16px' }}>
        <button 
          onClick={exportAllData}
          style={{ 
            marginRight: '8px', 
            padding: '8px 16px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Export All Data (JSON)
        </button>
        <button 
          onClick={exportRequests}
          style={{ 
            marginRight: '8px', 
            padding: '8px 16px', 
            backgroundColor: '#2196F3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Export Requests (JSON)
        </button>
        <button 
          onClick={exportResponses}
          style={{ 
            marginRight: '8px', 
            padding: '8px 16px', 
            backgroundColor: '#FF9800', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Export Responses (JSON)
        </button>
      </div>
      
      <div id="bids">
        {requests.map((req, i) => {
          const resp = getMatchingResponse(req.requestId);
          const bidInfo = extractBidInfoFromRequest(req.body);
          const bids = resp ? extractBidInfoFromResponse(resp.body) : null;
          
          return (
            <div key={i} className="bid" style={{ borderBottom: '1px solid #ccc', marginBottom: 8, paddingBottom: 8 }}>
              <div><strong>Request #{i + 1}</strong></div>
              <div style={{color: req.url?.includes('adsrvr.org')?'#0000cc':'auto'}}>URL: {req.url}</div>
              <div>Time: {new Date(req.time).toLocaleTimeString()}</div>
              {bidInfo && (
              <>
                {bidInfo.hasImpressions && `Impressions: ${bidInfo.impressionCount}`}<br />
                {bidInfo.bidPrices.length > 0 && `Bid Floors: ${bidInfo.bidPrices.map(p => `${p.price.toFixed(2)} ${p.currency}`).join(', ')}`}
              </>
              )}
              
              {/* Expandable bid details */}
              <details style={{ marginBottom: '8px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '4px 0' }}>
                Show Bid Request
              </summary>
              <div>
                <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
                {formatJson(req.body)}
                </pre>
              </div>
              </details>

              {/* Show response details if available */}
              {resp ? (
                <div className="response" style={{ marginTop: '10px' }}>
                  <strong>Response (requestId):{resp.requestId}:</strong><br />
                  <div style={{ color: resp.statusCode === 200 ? '#007700': 'auto'}}>Status: {resp.statusCode}</div>
                  <div>Time: {new Date(resp.time).toLocaleTimeString()}</div>
                  { bids && (
                    <>
                      {bids.hasBids ? `Bids Received: ${bids.bidCount}` : 'No Bids Received'}<br />
                      {bids.bidPrices.length > 0 && `Bid Prices: ${bids.bidPrices.map(p => p.toFixed(2)).join(', ')}`}<br />
                    </>
                  )}
                  <details style={{ marginBottom: '8px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold', padding: '4px 0' }}>
                      Show Bid Details
                    </summary>
                    <div>
                      <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
                        {formatJson(resp.body)}
                      </pre>
                    </div>
                  </details>
                </div>
              ): null}
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