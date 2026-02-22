import React from 'react';
import { styles } from './styles';

export const ActionBar = ({ onExport, onClear }) => {
  return (
    <div style={styles.actionBar}>
      <button
        onClick={onExport}
        style={{ ...styles.iconBtn, ...styles.btnExport }}
        title="Export All (JSON)"
        aria-label="Export All (JSON)"
      >
        ⬇️
      </button>
      <button
        onClick={onClear}
        style={{ ...styles.iconBtn, ...styles.btnClear }}
        title="Clear Data"
        aria-label="Clear Data"
      >
        🗑️
      </button>
    </div>
  );
};

export default ActionBar;
