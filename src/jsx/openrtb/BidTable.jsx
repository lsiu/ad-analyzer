import React, { useState } from 'react';
import { styles } from './styles';
import { getDomain, extractBidInfoFromRequest, extractBidInfoFromResponse, formatTime } from './utils';
import StatusBadge from './StatusBadge';

const BidRow = ({ req, resp, index, isExpanded, onToggle, onViewJson }) => {
  const reqInfo = extractBidInfoFromRequest(req.body);
  const respInfo = resp ? extractBidInfoFromResponse(resp.body) : null;
  const domain = getDomain(req.url);

  return (
    <>
      <tr
        style={{ ...styles.row, ...(isExpanded ? styles.rowExpanded : {}) }}
        onClick={onToggle}
      >
        <td style={styles.td}>{index + 1}</td>
        <td style={{ ...styles.td, ...styles.truncate }} title={domain}>{domain}</td>
        <td style={styles.td}>{formatTime(req.time)}</td>
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
            ? <span style={styles.priceHighlight}>${respInfo.highestBid.toFixed(2)}</span>
            : '-'}
        </td>
        <td style={styles.td}>
          <button
            onClick={(e) => { e.stopPropagation(); onViewJson('Request', req.body); }}
            style={{ ...styles.btn, ...styles.btnPrimary, marginRight: '4px' }}
          >
            Req
          </button>
          {resp && (
            <button
              onClick={(e) => { e.stopPropagation(); onViewJson('Response', resp.body); }}
              style={{ ...styles.btn, ...styles.btnSecondary }}
            >
              Resp
            </button>
          )}
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="9" style={styles.rowExpandedCell}>
            <div style={styles.detailsGrid}>
              <div>
                <strong>Request Details:</strong>
                <div style={styles.detailsText}>
                  <div><strong>URL:</strong> {req.url}</div>
                  <div><strong>Document:</strong> {req.documentURL}</div>
                  <div><strong>Request ID:</strong> {req.requestId}</div>
                </div>
              </div>
              {resp && (
                <div>
                  <strong>Response Details:</strong>
                  <div style={styles.detailsText}>
                    <div><strong>Status:</strong> {resp.statusCode}</div>
                    <div><strong>Response URL:</strong> {resp.url}</div>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export const BidTable = ({ requests, responses, onViewJson }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const getMatchingResponse = (requestId) => {
    const matchResponses = responses.filter(resp => resp.requestId === requestId);
    return matchResponses.length > 0 ? matchResponses[0] : null;
  };

  if (requests.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        No OpenRTB bid requests detected yet. Visit a website that serves ads to see bid data.
      </div>
    );
  }

  return (
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
        {requests.map((req, i) => (
          <BidRow
            key={req.requestId}
            req={req}
            resp={getMatchingResponse(req.requestId)}
            index={i}
            isExpanded={expandedRow === i}
            onToggle={() => setExpandedRow(expandedRow === i ? null : i)}
            onViewJson={onViewJson}
          />
        ))}
      </tbody>
    </table>
  );
};

export default BidTable;
