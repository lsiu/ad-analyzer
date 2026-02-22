import React from 'react';
import { styles } from './styles';

export const StatusBadge = ({ hasResponse, bidCount }) => {
  if (!hasResponse) {
    return <span style={{ ...styles.badge, ...styles.badgeWarning }}>No Response</span>;
  }
  if (bidCount === 0) {
    return <span style={{ ...styles.badge, ...styles.badgeDanger }}>No Bids</span>;
  }
  return <span style={{ ...styles.badge, ...styles.badgeSuccess }}>{bidCount} Bid{bidCount > 1 ? 's' : ''}</span>;
};

export default StatusBadge;
