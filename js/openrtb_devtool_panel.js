// devtools.js - Displays OpenRTB bid requests and responses

function renderBidData(data) {
  const bidsDiv = document.getElementById('bids');
  bidsDiv.innerHTML = '';
  data.requests.forEach((req, i) => {
    const el = document.createElement('div');
    el.className = 'bid';
    el.innerHTML = `<strong>Request #${i+1}</strong><br>URL: ${req.url}<br>Time: ${new Date(req.time).toLocaleTimeString()}<br><pre>${JSON.stringify(req.body, null, 2)}</pre>`;
    bidsDiv.appendChild(el);
  });
  data.responses.forEach((res, i) => {
    const el = document.createElement('div');
    el.className = 'response';
    el.innerHTML = `<strong>Response #${i+1}</strong><br>URL: ${res.url}<br>Status: ${res.statusCode}<br>Time: ${new Date(res.time).toLocaleTimeString()}`;
    bidsDiv.appendChild(el);
  });
}

// Only use port-based communication for Manifest V3
function fetchBidDataViaPort() {
  const port = chrome.runtime.connect({name: 'devtools'});
  port.postMessage({type: 'getBidData'});
  port.onMessage.addListener(function(response) {
    if (response && response.type === 'bidData') {
      renderBidData(response.data);
    }
  });
}

document.addEventListener('DOMContentLoaded', fetchBidDataViaPort);

console.log('DevTools panel loaded');