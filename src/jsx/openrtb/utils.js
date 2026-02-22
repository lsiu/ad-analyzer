// Utility functions for bid data extraction and formatting

export const formatJson = (str) => {
  try {
    const obj = JSON.parse(str);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return str;
  }
};

export const extractBidInfoFromRequest = (requestBody) => {
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
          bidInfo.bidPrices.push({ price: imp.bidfloor, currency: imp.bidfloorcur });
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

export const extractBidInfoFromResponse = (responseBody) => {
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

export const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString();
};

export const formatPrice = (price, currency = 'USD') => {
  return `${price.toFixed(2)} ${currency}`;
};

export const exportAllData = (requests, responses) => {
  const data = { requests, responses, exportTime: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `openrtb-bid-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const clearData = (setRequests, setResponses) => {
  const port = chrome.runtime.connect({ name: 'devtools' });
  port.postMessage({ type: 'clearBidData' });
  port.disconnect();
  setRequests([]);
  setResponses([]);
};
