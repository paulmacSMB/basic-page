let brandingData = {};
let linksData = [];

function ensureContentScript(tabId, callback) {
  chrome.scripting.executeScript(
    {
      target: { tabId },
      func: () => !!window.__contentScriptInjected, // Check if script is already running
    },
    (results) => {
      if (results && results[0] && results[0].result) {
        console.log(`⚡ Content script already running in tab ${tabId}`);
        callback(); // Proceed without reinjection
      } else {
        // Inject content script
        chrome.scripting.executeScript(
          {
            target: { tabId },
            files: ["content-script.js"],
          },
          () => {
            console.log(`✅ Content script injected into tab ${tabId}`);
            callback();
          }
        );
      }
    }
  );
}


chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length > 0 && tabs[0].id) {
    ensureContentScript(tabs[0].id, () => {
      chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_BRANDING" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Error sending message:", chrome.runtime.lastError.message);
        } else {
          console.log("✅ Message successfully sent!", response);
        }
      });
    });
  }
});

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
  chrome.tabs.sendMessage(activeInfo.tabId, { type: "UPDATE_BRANDING" }, (response) => {
    if (chrome.runtime.lastError) {
      console.warn("Skipping tab - No content script found:", chrome.runtime.lastError.message);
    }
  });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "WEB_BRANDING") {
    brandingData = message.payload;
    console.log("Updated web brand data:", brandingData);
    sendResponse({ success: true }); 
  } else if (message.type === "GET_BRANDING") {
    console.log("Sending branding data:", brandingData);
    sendResponse(brandingData); 
  } else if (message.type === "NAVIGATE_TO_LINK") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_BRANDING" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Error sending message:", chrome.runtime.lastError.message);
          }
        });
      }
    });

    sendResponse({ success: true }); 
  }

  return true; // 🔹 Important: This keeps sendResponse() alive for async calls.
});

// Keep the background script alive
setInterval(() => {
  chrome.runtime.sendMessage({ type: "KEEP_ALIVE" }, () => {
    if (chrome.runtime.lastError) {
      console.warn("KEEP_ALIVE error:", chrome.runtime.lastError.message);
    }
  });
}, 25000);
