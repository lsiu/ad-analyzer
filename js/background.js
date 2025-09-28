// background.js - Monitors OpenRTB bid requests using chrome.debugger API and updates badge

let bidRequestCount = 0;
let bidRequests = [];
let bidResponses = [];
let attachedTabs = new Set(); // Track tabs we're debugging
let pendingRequests = new Map(); // Track requests waiting for post data

// Helper: Check if request body is likely OpenRTB
function isOpenRTBBidRequestBody(requestBody) {
    if (!requestBody) return false;
    try {
        // Try to parse the request body as JSON
        const json = JSON.parse(requestBody);
        return json.id && json.imp && Array.isArray(json.imp);
    } catch (e) {
        console.log("Error parsing potential OpenRTB request:", e.message);
    }
    return false;
}

// Function to attach debugger to a tab
function attachDebugger(tabId) {
    if (attachedTabs.has(tabId)) return; // Already attached

    chrome.debugger.attach({ tabId: tabId }, "1.0", () => {
        if (chrome.runtime.lastError) {
            console.error("Failed to attach debugger:", chrome.runtime.lastError.message);
            return;
        }

        attachedTabs.add(tabId);
        console.log("Debugger attached to tab:", tabId);

        // Enable network domain to receive network events
        chrome.debugger.sendCommand({ tabId: tabId }, "Network.enable");

        // Listen for network events
        chrome.debugger.onEvent.addListener(onDebuggerEvent);
    });
}

// Function to detach debugger from a tab
function detachDebugger(tabId) {
    if (!attachedTabs.has(tabId)) return; // Not attached

    chrome.debugger.detach({ tabId: tabId }, () => {
        attachedTabs.delete(tabId);
        console.log("Debugger detached from tab:", tabId);
    });
}

// Handle debugger events
function onDebuggerEvent(source, method, params) {
    // Only process Network domain events
    if (!method.startsWith('Network.')) return;

    if (method === 'Network.requestWillBeSent') {
        // Check if this is a POST request with potential OpenRTB data
        if (params.request.method === 'POST' && (params.type === 'Fetch' || params.type === 'XHR')) {
            // Store the request details to match with post data when available
            pendingRequests.set(params.requestId, {
                url: params.request.url,
                method: params.request.method,
                headers: params.request.headers,
                timestamp: params.timestamp,
                tabId: source.tabId
            });

            // Try to get the post data immediately
            chrome.debugger.sendCommand(source, "Network.getRequestPostData", { requestId: params.requestId }, (result) => {
                if (!chrome.runtime.lastError && result && result.postData) {
                    // Check if the request body is OpenRTB
                    if (isOpenRTBBidRequestBody(result.postData)) {
                        bidRequestCount++;
                        bidRequests.push({
                            url: params.request.url,
                            body: result.postData,
                            time: Date.now(),
                            requestId: params.requestId,
                            tabId: source.tabId
                        });
                        chrome.action.setBadgeText({ text: bidRequestCount.toString() });
                    }
                    
                    // Remove from pending requests
                    pendingRequests.delete(params.requestId);
                }
            });
        }
    } else if (method === 'Network.requestServedFromCache') {
        // Remove from pending if request is served from cache
        if (pendingRequests.has(params.requestId)) {
            pendingRequests.delete(params.requestId);
        }
    } else if (method === 'Network.responseReceived') {
        // Handle response received
        // Check if this matches a previously detected OpenRTB request
        const matchedRequest = bidRequests.find(req => req.requestId === params.requestId);
        if (matchedRequest) {
            const response = {
                url: params.response.url,
                statusCode: params.response.status,
                time: Date.now(),
                requestId: params.requestId,
                tabId: source.tabId
            };
            
            bidResponses.push(response);

            // Try to get the response body as well
            chrome.debugger.sendCommand(source, "Network.getResponseBody", { requestId: params.requestId }, (result) => {
                if (!chrome.runtime.lastError && result && result.body) {
                    // Update the stored response with the body if available
                    const responseIndex = bidResponses.findIndex(r => r.requestId === params.requestId);
                    if (responseIndex !== -1) {
                        // Decode if base64 encoded
                        bidResponses[responseIndex].body = result.base64Encoded ? atob(result.body) : result.body;
                    }
                }
            });
        }
    } else if (method === 'Network.loadingFinished') {
        // Handle loading finished to get response body if not already retrieved
        const matchedRequest = bidRequests.find(req => req.requestId === params.requestId);
        if (matchedRequest) {
            chrome.debugger.sendCommand(source, "Network.getResponseBody", { requestId: params.requestId }, (result) => {
                if (!chrome.runtime.lastError && result && result.body) {
                    // Update the stored response with the body
                    const responseIndex = bidResponses.findIndex(r => r.requestId === params.requestId);
                    if (responseIndex !== -1) {
                        // Decode if base64 encoded
                        bidResponses[responseIndex].body = result.base64Encoded ? atob(result.body) : result.body;
                    }
                }
            });
        }
        
        // Remove from pending if still there
        if (pendingRequests.has(params.requestId)) {
            pendingRequests.delete(params.requestId);
        }
    } else if (method === 'Network.loadingFailed') {
        // Remove from pending if loading failed
        if (pendingRequests.has(params.requestId)) {
            pendingRequests.delete(params.requestId);
        }
    } else if (method === 'Network.dataReceived') {
        // Additional event for data received
        if (pendingRequests.has(params.requestId)) {
            // Try again to get post data for pending requests
            chrome.debugger.sendCommand(source, "Network.getRequestPostData", { requestId: params.requestId }, (result) => {
                if (!chrome.runtime.lastError && result && result.postData) {
                    // Check if the request body is OpenRTB
                    if (isOpenRTBBidRequestBody(result.postData)) {
                        bidRequestCount++;
                        bidRequests.push({
                            url: pendingRequests.get(params.requestId).url,
                            body: result.postData,
                            time: Date.now(),
                            requestId: params.requestId,
                            tabId: source.tabId
                        });
                        chrome.action.setBadgeText({ text: bidRequestCount.toString() });
                    }
                    
                    // Remove from pending requests
                    pendingRequests.delete(params.requestId);
                }
            });
        }
    }
}

// Listen for new tabs to attach debugger
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        attachDebugger(tabId);
    }
});

// Clean up debugger when tab is removed
chrome.tabs.onRemoved.addListener((tabId) => {
    if (attachedTabs.has(tabId)) {
        detachDebugger(tabId);
    }
});

// Clean up debugger when extension is disconnected
chrome.runtime.onSuspend.addListener(() => {
    attachedTabs.forEach(tabId => {
        detachDebugger(tabId);
    });
});

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
