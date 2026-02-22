import React from 'react';
import { styles } from './styles';

export const ActionBar = ({ onExport, onClear }) => {
  return (
    <div style={styles.buttonBar}>
      <button onClick={onExport} style={{ ...styles.btn, ...styles.btnExport }}>
        Export All (JSON)
      </button>
      <button onClick={onClear} style={{ ...styles.btn, ...styles.btnClear }}>
        Clear Data
      </button>
    </div>
  );
};

export default ActionBar;
