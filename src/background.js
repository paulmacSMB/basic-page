let brandingData = {};
let linksData = [];

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
      // ✅ Handle content script errors gracefully
      chrome.tabs.sendMessage(tab.id, { type: "UPDATE_PAGE_DATA" }).catch(() => {
        if (chrome.runtime.lastError) {
          console.warn("Skipping tab - No content script found:", chrome.runtime.lastError.message);
        }
      });
    }
  });
});

// ✅ SINGLE MESSAGE LISTENER ✅
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PAGE_DATA") {
    // Store branding and links data
    brandingData = {
      title: message.payload.title,
      description: message.payload.description,
    };
    linksData = message.payload.links || [];
    console.log("Updated branding and links data in background:", brandingData, linksData);
    sendResponse({ success: true });
  } else if (message.type === "GET_BRANDING") {
    console.log("Sending branding data to popup:", brandingData);
    sendResponse(brandingData);
  } else if (message.type === "GET_LINKS") {
    console.log("Sending links data to popup:", linksData);
    sendResponse(linksData);
  }

  return true; // Required for async sendResponse
});

// 🔥 Keep the background script alive
setInterval(() => {
  chrome.runtime.sendMessage({ type: "KEEP_ALIVE" }, () => {
    if (chrome.runtime.lastError) {
      console.warn("KEEP_ALIVE error:", chrome.runtime.lastError.message);
    }
  });
}, 25000);
