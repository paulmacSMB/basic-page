let brandingData = {};
let linksData = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_SCRIPT_LOADED") {
    console.log("✅ Content script is now active!");
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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "WEB_BRANDING") {
    brandingData = message.payload;
    console.log("Updated web brand data:", brandingData);
    sendResponse({ success: true }); 
  } else if (message.type === "GET_BRANDING") {
    console.log("Sending branding data:", brandingData);
    sendResponse(brandingData); 
  } else  if (message.type === "EXTENSION_NAVIGATE" && message.url) {
    
    chrome.tabs.query({}, (tabs) => {
      let targetTab = tabs.find(tab => tab.active && tab.url && !tab.url.startsWith("chrome-extension://"));
      console.log("targetTab", targetTab);
      if (targetTab && targetTab.id) {
        console.log("📡 Forwarding navigation request to content script:", message.url);
       
        // Inject content script if it isn't already injected
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content-script.js"]
        }, () => {
          console.log("✅ Content script injected");
          
         // Now send the message to the content script
          chrome.tabs.sendMessage(targetTab.id, { type: "UPDATE_PAGE_SECTION", url: message.url }, (response) => {
            if (chrome.runtime.lastError) {
              console.error("❌ Error sending message to content script:", chrome.runtime.lastError.message);
            } else {
              console.log("✅ Content script updated the page:", response);
            }
          });
        });

        sendResponse({ success: true });
      } else {
        console.error("❌ No valid tab found.");
        sendResponse({ success: false, error: "No valid tab found." });
      }
    });

    return true; // Keep the sendResponse alive
  }
});
let popupWindowId = null;

// Listen when the extension popup is opened
chrome.windows.onCreated.addListener((window) => {
  chrome.windows.get(window.id, { populate: true }, (win) => {
    if (win && win.type === "popup") {
      console.log("🔹 Extension popup opened, tracking ID:", win.id);
      popupWindowId = win.id;
    }
  });
});

// Listen for popup closure and reset ID
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    console.log("🔸 Extension popup closed, resetting ID.");
    popupWindowId = null;
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "POPUP_OPENED" && sender.tab) {
    console.log("🔹 Popup tab detected:", sender.tab.id);
  }
});


// Keep the background script alive
setInterval(() => {
  chrome.runtime.sendMessage({ type: "KEEP_ALIVE" }, () => {
    if (chrome.runtime.lastError) {
      console.warn("KEEP_ALIVE error:", chrome.runtime.lastError.message);
    }
  });
}, 25000);
