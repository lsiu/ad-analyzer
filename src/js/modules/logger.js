// Logging utility with styled prefix for AdAnalyzer

const PREFIX = '%cAdAnalyzer%c ';
const PREFIX_STYLE = 'background: #ff0000; color: #ffffff; padding: 2px 4px; border-radius: 2px;';
const RESET_STYLE = '';

export const log = (...args) => {
  console.log(PREFIX, PREFIX_STYLE, RESET_STYLE, ...args);
};

export const debug = (...args) => {
  console.debug(PREFIX, PREFIX_STYLE, RESET_STYLE, ...args);
};

export const error = (...args) => {
  console.error(PREFIX, PREFIX_STYLE, RESET_STYLE, ...args);
};

export const warn = (...args) => {
  console.warn(PREFIX, PREFIX_STYLE, RESET_STYLE, ...args);
};
