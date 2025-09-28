// background.js - Monitors OpenRTB bid requests and updates badge

let bidRequestCount = 0;
let bidRequests = [];
let bidResponses = [];

// Helper: Check if request is likely OpenRTB
function isOpenRTBBidRequest(details) {
    if (details.method !== 'POST') return false;
    try {
        const contentType = details.requestHeaders?.find(h => h.name.toLowerCase() === 'content-type')?.value || '';
        if (details.type !== 'xmlhttprequest') return false;
        // Only check for typical OpenRTB fields in body
        if (details.requestBody && details.requestBody.raw && details.requestBody.raw[0]) {
            const decoder = new TextDecoder('utf-8');
            const body = decoder.decode(details.requestBody.raw[0].bytes);
            const json = JSON.parse(body);
            return json.id && json.imp;
        }
    } catch (e) { }
    return false;
}

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        // Only POST requests with requestBody
        if (isOpenRTBBidRequest(details)) {
            bidRequestCount++;
            // Join all raw bytes and decode into a string
            let rawBytes = [];
            if (details.requestBody && details.requestBody.raw) {
                details.requestBody.raw.forEach(part => {
                    if (part.bytes) rawBytes.push(...new Uint8Array(part.bytes));
                });
            }
            const decoder = new TextDecoder('utf-8');
            const bodyString = rawBytes.length ? decoder.decode(new Uint8Array(rawBytes)) : '';
            bidRequests.push({
                url: details.url,
                body: bodyString,
                time: Date.now()
            });
            chrome.action.setBadgeText({ text: bidRequestCount.toString() });
        }
    },
    { urls: ["<all_urls>"] },
    ["requestBody", "extraHeaders"]
);

chrome.webRequest.onCompleted.addListener(
    function (details) {
        // Only store response if it matches a previously detected OpenRTB bid request URL
        const matchedRequest = bidRequests.find(req => req.url === details.url);
        if (matchedRequest) {
            // Try to get response body if possible (this is limited by Chrome's API)
            // For now, we'll just store the basic response info
            bidResponses.push({
                url: details.url,
                statusCode: details.statusCode,
                time: Date.now()
            });
        }
        // No push message; data is available via getBidData request
    },
    { urls: ["<all_urls>"] },
    ["responseHeaders"]
);

// Expose bidRequests and bidResponses for devtools using long-lived port
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === 'devtools') {
        port.onMessage.addListener(function (msg) {
            if (msg.type === 'getBidData') {
                port.postMessage({ type: 'bidData', data: { requests: bidRequests, responses: bidResponses } });
            }
        });
    }
});
