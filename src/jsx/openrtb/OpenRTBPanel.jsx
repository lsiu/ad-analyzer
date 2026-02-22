import React, { useState, useEffect } from 'react';
import { styles } from './styles';
import { exportAllData, clearData } from './utils';
import ActionBar from './ActionBar';
import BidTable from './BidTable';
import JsonModal from './JsonModal';

const OpenRTBPanel = () => {
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState([]);
  const [viewingJson, setViewingJson] = useState(null);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: 'devtools' });
    port.postMessage({ type: 'getBidData' });

    port.onMessage.addListener(function(response) {
      if (response && response.type === 'bidData') {
        setRequests(response.data.requests);
        setResponses(response.data.responses);
      }
    });

    const intervalId = setInterval(() => {
      if (!viewingJson) {
        port.postMessage({ type: 'getBidData' });
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
      port.disconnect();
    };
  }, [viewingJson]);

  const handleExport = () => exportAllData(requests, responses);
  const handleClear = () => {
    clearData(setRequests, setResponses);
  };

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: '16px', margin: '0 0 12px 0' }}>OpenRTB Bid Requests & Responses</h2>

      <ActionBar onExport={handleExport} onClear={handleClear} />

      <BidTable
        requests={requests}
        responses={responses}
        onViewJson={(title, data) => setViewingJson({ title, data })}
      />

      {viewingJson && (
        <JsonModal
          data={viewingJson.data}
          title={viewingJson.title}
          onClose={() => setViewingJson(null)}
        />
      )}
    </div>
  );
};

export default OpenRTBPanel;
