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
              <div>
                <pre style={{ background: '#f5f5f5', padding: 8, overflowX: 'auto' }}>
                  {formatJson(req.body)}
                </pre>
              </div>
              {matchingResponses.length > 0 && matchingResponses.map((resp, j) => (
                <div key={j} className="response" style={{ color: '#007700' }}>
                  <strong>Response #{j + 1}:</strong><br />
                  Status: {resp.statusCode}<br />
                  Time: {new Date(resp.time).toLocaleTimeString()}
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