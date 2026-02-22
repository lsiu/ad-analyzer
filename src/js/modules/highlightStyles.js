// Shared highlight styles for injection into documents

export const HIGHLIGHT_CLASS = 'ad-highlighter-border';
export const STYLE_ID = 'ad-highlighter-styles';

export const highlightStyles = `
  .${HIGHLIGHT_CLASS} {
    outline: 3px dashed #ff0000 !important;
    outline-offset: -3px !important;
  }
`;
