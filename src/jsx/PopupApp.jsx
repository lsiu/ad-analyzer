import React, { useState, useEffect } from 'react';
import OpenRTBPanel from './openrtb/OpenRTBPanel';

const PopupApp = () => {
  const [status, setStatus] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAds = () => {
    setIsRefreshing(true);
    setStatus('');

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "highlightAds" }, function(response) {
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

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'devtools' });
    port.postMessage({ type: 'getBidData' });

    port.onMessage.addListener(function(response) {
      if (response && response.type === 'bidData') {
        port.postMessage({ type: 'getBidData' });
      }
    });

    return () => {
      port.disconnect();
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Ad Highlighter</h1>
          <p style={styles.description}>Ads on this page are highlighted with red borders.</p>
        </div>
        <button
          id="refresh"
          onClick={handleRefreshAds}
          disabled={isRefreshing}
          style={{
            ...styles.refreshButton,
            backgroundColor: isRefreshing ? '#cccccc' : '#4CAF50',
            cursor: isRefreshing ? 'not-allowed' : 'pointer'
          }}
          title="Refresh Ad Detection"
          aria-label="Refresh Ad Detection"
        >
          ↻
        </button>
      </div>

      {status && (
        <div
          id="status"
          style={{
            ...styles.status,
            ...(status.includes("Error") ? styles.statusError : styles.statusSuccess)
          }}
        >
          {status}
        </div>
      )}

      <OpenRTBPanel />
    </div>
  );
};

const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    padding: '12px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px'
  },
  title: {
    fontSize: '16px',
    margin: '0 0 4px 0',
    color: '#333'
  },
  description: {
    fontSize: '12px',
    margin: 0,
    color: '#666'
  },
  refreshButton: {
    border: 'none',
    color: 'white',
    padding: '8px 12px',
    fontSize: '18px',
    borderRadius: '4px',
    lineHeight: 1
  },
  status: {
    marginTop: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    fontSize: '12px'
  },
  statusSuccess: {
    backgroundColor: '#dff0d8',
    color: '#3c763d'
  },
  statusError: {
    backgroundColor: '#f2dede',
    color: '#a94442'
  }
};

export default PopupApp;
