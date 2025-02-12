let brandingData = {};

chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL("index.html"), // Load your Angular UI here
    type: "popup",
    width: 1000,
    height: 1200,
  });
});

// User switches tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log("Switched to tab:", tab);
    if (tab && tab.id) {
      // ✅ Try sending the message, but catch errors if the content script isn’t loaded
      chrome.tabs.sendMessage(tab.id, { type: "UPDATE_BRANDING" }).catch((err) => {
        if (chrome.runtime.lastError) {
          console.warn("Skipping tab - No content script found:", chrome.runtime.lastError.message);
        }
      });
    }
  });
});

// SINGLE MESSAGE LISTENER 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "WEB_BRANDING") {
    brandingData = message.payload;
    console.log("Getting data in background:", brandingData);
    sendResponse({ success: true });
  } else if (message.type === "GET_BRANDING") {
    console.log("Sending data to popup:", brandingData);
    sendResponse(brandingData);
  }

  return true; // Required for async sendResponse
});

//  Keep the background script alive
setInterval(() => {
  chrome.runtime.sendMessage({ type: "KEEP_ALIVE" }, () => {
    if (chrome.runtime.lastError) {
      console.warn("KEEP_ALIVE error:", chrome.runtime.lastError.message);
    }
  });
}, 25000);


  