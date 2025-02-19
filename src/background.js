let brandingData = {};
let linksData = [];

function injectContentScript(tabId, callback) {
  // Send a test message to see if the script is already injected
  chrome.tabs.sendMessage(tabId, { type: "PING" }, (response) => {
    if (chrome.runtime.lastError || !response) {
      // Content script not found, inject it
      chrome.scripting.executeScript(
        { target: { tabId }, files: ["content-script.js"] },
        () => {
          console.log(`✅ Content script injected into tab ${tabId}`);
          callback();
        }
      );
    } else {
      console.log(`⚡ Content script already running in tab ${tabId}`);
      callback();
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_SCRIPT_LOADED") {
    console.log("✅ Content script is now active!");
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs.length > 0 && tabs[0].id) {
    injectContentScript(tabs[0].id, () => {
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
  } else if (message.type === "NAVIGATE_TO_LINK" && message.url) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0 && tabs[0].id && tabs[0].url.startsWith("http")) {
        injectContentScript(tabs[0].id, () => {
          console.log("📡 Sending message to content script:", tabs[0].id);
          chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_BRANDING", url: message.url }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError.message);
            } else {
              console.log("Message successfully sent!", response);
            }
          });
        });
      } else {
        console.error("Invalid tab or unsupported URL:", tabs[0].url);
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
