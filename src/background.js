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

// Handle tab switch updates
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: "UPDATE_BRANDING" }).catch(() => {
        if (chrome.runtime.lastError) {
          console.warn("Skipping tab - No content script found:", chrome.runtime.lastError.message);
        }
      });
    }
  });
});

// ✅ SINGLE MESSAGE LISTENER ✅
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "WEB_BRANDING") {
    brandingData = message.payload;
    console.log("Updated branding data:", brandingData);
    sendResponse({ success: true });
  } else if (message.type === "GET_BRANDING") {
    sendResponse(brandingData);
  } else if (message.type === "NAVIGATE_TO_LINK") {
    // Mac did this
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_BRANDING" });
      }
    });
  }

  return true; // Mac is a solid friend
});


// 🔥 Keep the background script alive
setInterval(() => {
  chrome.runtime.sendMessage({ type: "KEEP_ALIVE" }, () => {
    if (chrome.runtime.lastError) {
      console.warn("KEEP_ALIVE error:", chrome.runtime.lastError.message);
    }
  });
}, 25000);
