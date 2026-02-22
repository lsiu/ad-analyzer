import React, { useRef, useEffect } from 'react';
import { styles } from './styles';
import { formatJson } from './utils';

// Module-level ref to persist scroll position across modal open/close
const scrollPositionRef = { current: { x: 0, y: 0 } };

export const JsonModal = ({ data, onClose, title }) => {
  const preRef = useRef(null);

  useEffect(() => {
    // Restore scroll position when modal opens
    if (preRef.current && scrollPositionRef.current) {
      preRef.current.scrollLeft = scrollPositionRef.current.x;
      preRef.current.scrollTop = scrollPositionRef.current.y;
    }
  }, []);

  const handleScroll = (e) => {
    // Save scroll position on scroll
    scrollPositionRef.current = { 
      x: e.target.scrollLeft, 
      y: e.target.scrollTop 
    };
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ ...styles.btn, ...styles.btnSecondary }}>✕ Close</button>
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

export default JsonModal;
