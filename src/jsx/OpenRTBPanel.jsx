import React, { useState, useEffect, useRef } from 'react';

const OpenRTBPanel = () => {
  const [requests, setRequests] = useState([]);
  const [responses, setResponses] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [viewingJson, setViewingJson] = useState(null);
  
  const modalRef = useRef(null);
  const scrollPosRef = useRef({ x: 0, y: 0 });

  // Connect to background script to fetch bid data
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
      // Only refresh if modal is not open
      if (!viewingJson) {
        port.postMessage({ type: 'getBidData' });
      }
    }, 2000);

    return () => {
      clearInterval(intervalId);
      port.disconnect();
    };
  }, [viewingJson]);

  // Save/restore scroll position when modal opens/closes
  useEffect(() => {
    if (viewingJson) {
      // Modal opened - save scroll position
      const modalEl = modalRef.current;
      if (modalEl) {
        scrollPosRef.current = { x: modalEl.scrollLeft, y: modalEl.scrollTop };
      }
    }
  }, [viewingJson]);

  const formatJson = (str) => {
    try {
      const obj = JSON.parse(str);
      return JSON.stringify(obj, null, 2);
    } catch (e) {
      return str;
    }
  };

  const extractBidInfoFromRequest = (requestBody) => {
    try {
      const reqObj = typeof requestBody === 'string' ? JSON.parse(requestBody) : requestBody;
      const bidInfo = {
        hasImpressions: false,
        impressionCount: 0,
        hasBids: false,
        hasPriceInfo: false,
        bidPrices: [],
        domains: []
      };

      if (reqObj && reqObj.imp) {
        bidInfo.hasImpressions = true;
        bidInfo.impressionCount = reqObj.imp.length;

        for (const imp of reqObj.imp) {
          if (imp.bidfloor) {
            bidInfo.hasPriceInfo = true;
            bidInfo.bidPrices.push({price: imp.bidfloor, currency: imp.bidfloorcur});
          }
          if (imp.ext?.gpid || imp.tagid) {
            bidInfo.domains.push(imp.ext?.gpid || imp.tagid);
          }
        }
      }

      if (reqObj.id) bidInfo.hasBids = true;
      if (reqObj.site?.domain) bidInfo.domains.push(reqObj.site.domain);

      return bidInfo;
    } catch (e) {
      console.error('Error parsing request for bid info:', e);
      return null;
    }
  };

  const getMatchingResponse = (requestId) => {
    const matchResponses = responses.filter(resp => resp.requestId === requestId);
    if (matchResponses.length > 0) {
      return matchResponses[0];
    }
    return null;
  };

  const extractBidInfoFromResponse = (responseBody) => {
    try {
      const respObj = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
      const bidInfo = { hasBids: false, bidCount: 0, bidPrices: [], highestBid: 0 };

      if (respObj && respObj.seatbid) {
        bidInfo.hasBids = true;
        bidInfo.bidCount = respObj.seatbid.reduce((count, seat) => count + (seat.bid ? seat.bid.length : 0), 0);
        for (const seat of respObj.seatbid) {
          if (seat.bid) {
            for (const bid of seat.bid) {
              if (bid.price) {
                bidInfo.bidPrices.push(bid.price);
                if (bid.price > bidInfo.highestBid) {
                  bidInfo.highestBid = bid.price;
                }
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

  const getDomain = (url) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const exportAllData = () => {
    const data = { requests, responses, exportTime: new Date().toISOString() };
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

  const clearData = () => {
    const port = chrome.runtime.connect({ name: 'devtools' });
    port.postMessage({ type: 'clearBidData' });
    port.disconnect();
    setRequests([]);
    setResponses([]);
  };

  const styles = {
    container: { fontFamily: 'Arial, sans-serif', margin: 0, fontSize: '12px' },
    buttonBar: { marginBottom: '12px', display: 'flex', gap: '8px' },
    btn: { padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' },
    btnExport: { backgroundColor: '#4CAF50', color: 'white' },
    btnClear: { backgroundColor: '#f44336', color: 'white' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
    th: { textAlign: 'left', padding: '8px 6px', borderBottom: '2px solid #ddd', backgroundColor: '#f8f9fa', position: 'sticky', top: 0 },
    td: { padding: '8px 6px', borderBottom: '1px solid #eee', verticalAlign: 'top' },
    row: { cursor: 'pointer' },
    rowExpanded: { backgroundColor: '#f0f7ff' },
    badge: { display: 'inline-block', padding: '2px 6px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold' },
    badgeSuccess: { backgroundColor: '#d4edda', color: '#155724' },
    badgeWarning: { backgroundColor: '#fff3cd', color: '#856404' },
    badgeDanger: { backgroundColor: '#f8d7da', color: '#721c24' },
    badgeInfo: { backgroundColor: '#d1ecf1', color: '#0c5460' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '90%', maxHeight: '90%', width: '800px', display: 'flex', flexDirection: 'column' },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 },
    modalBody: { background: '#f5f5f5', padding: '12px', overflow: 'auto', fontSize: '11px', borderRadius: '4px', flex: 1, minHeight: 0 },
    truncate: { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
  };

  const StatusBadge = ({ hasResponse, bidCount }) => {
    if (!hasResponse) {
      return <span style={{...styles.badge, ...styles.badgeWarning}}>No Response</span>;
    }
    if (bidCount === 0) {
      return <span style={{...styles.badge, ...styles.badgeDanger}}>No Bids</span>;
    }
    return <span style={{...styles.badge, ...styles.badgeSuccess}}>{bidCount} Bid{bidCount > 1 ? 's' : ''}</span>;
  };

  const JsonModal = ({ data, onClose, title }) => {
    const preRef = useRef(null);

    useEffect(() => {
      // Restore scroll position after content renders
      if (preRef.current) {
        preRef.current.scrollLeft = scrollPosRef.current.x;
        preRef.current.scrollTop = scrollPosRef.current.y;
      }
    }, []);

    const handleScroll = (e) => {
      // Save scroll position on scroll
      scrollPosRef.current = { x: e.target.scrollLeft, y: e.target.scrollTop };
    };

    return (
      <div style={styles.modal} onClick={onClose}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <h3 style={{margin: 0}}>{title}</h3>
            <button onClick={onClose} style={{...styles.btn, backgroundColor: '#6c757d', color: 'white'}}>✕ Close</button>
          </div>
          <pre 
            ref={preRef}
            onScroll={handleScroll}
            style={styles.modalBody}
          >
            {formatJson(data)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={{fontSize: '16px', margin: '0 0 12px 0'}}>OpenRTB Bid Requests & Responses</h2>

      <div style={styles.buttonBar}>
        <button onClick={exportAllData} style={{...styles.btn, ...styles.btnExport}}>Export All (JSON)</button>
        <button onClick={clearData} style={{...styles.btn, ...styles.btnClear}}>Clear Data</button>
      </div>

      {requests.length === 0 ? (
        <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
          No OpenRTB bid requests detected yet. Visit a website that serves ads to see bid data.
        </div>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Domain</th>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Imp</th>
              <th style={styles.th}>Floor</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Bids</th>
              <th style={styles.th}>Highest</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, i) => {
              const resp = getMatchingResponse(req.requestId);
              const reqInfo = extractBidInfoFromRequest(req.body);
              const respInfo = resp ? extractBidInfoFromResponse(resp.body) : null;
              const isExpanded = expandedRow === i;
              const domain = getDomain(req.url);

              return (
                <React.Fragment key={req.requestId}>
                  <tr 
                    style={{...styles.row, ...(isExpanded ? styles.rowExpanded : {})}}
                    onClick={() => setExpandedRow(isExpanded ? null : i)}
                  >
                    <td style={styles.td}>{i + 1}</td>
                    <td style={{...styles.td, ...styles.truncate}} title={domain}>{domain}</td>
                    <td style={styles.td}>{new Date(req.time).toLocaleTimeString()}</td>
                    <td style={styles.td}>{reqInfo?.impressionCount || '-'}</td>
                    <td style={styles.td}>
                      {reqInfo?.bidPrices?.length > 0 
                        ? `${reqInfo.bidPrices[0].price.toFixed(2)} ${reqInfo.bidPrices[0].currency || 'USD'}`
                        : '-'}
                    </td>
                    <td style={styles.td}>
                      <StatusBadge hasResponse={!!resp} bidCount={respInfo?.bidCount || 0} />
                    </td>
                    <td style={styles.td}>{respInfo?.bidCount || '-'}</td>
                    <td style={styles.td}>
                      {respInfo?.highestBid > 0 
                        ? <span style={{fontWeight: 'bold', color: '#28a745'}}>${respInfo.highestBid.toFixed(2)}</span>
                        : '-'}
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setViewingJson({title: 'Request', data: req.body}); }}
                        style={{...styles.btn, backgroundColor: '#007bff', color: 'white', marginRight: '4px'}}
                      >
                        Req
                      </button>
                      {resp && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setViewingJson({title: 'Response', data: resp.body}); }}
                          style={{...styles.btn, backgroundColor: '#6c757d', color: 'white'}}
                        >
                          Resp
                        </button>
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan="9" style={{padding: '12px', backgroundColor: '#f8f9fa'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                          <div>
                            <strong>Request Details:</strong>
                            <div style={{fontSize: '10px', marginTop: '4px'}}>
                              <div><strong>URL:</strong> {req.url}</div>
                              <div><strong>Document:</strong> {req.documentURL}</div>
                              <div><strong>Request ID:</strong> {req.requestId}</div>
                            </div>
                          </div>
                          {resp && (
                            <div>
                              <strong>Response Details:</strong>
                              <div style={{fontSize: '10px', marginTop: '4px'}}>
                                <div><strong>Status:</strong> {resp.statusCode}</div>
                                <div><strong>Response URL:</strong> {resp.url}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}

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
