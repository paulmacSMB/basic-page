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

// chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
//   if (tabs.length > 0 && tabs[0].id && tabs[0].url.startsWith("http")) {
//     injectContentScript(tabs[0].id, () => {
//       console.log("📡 Sending message to content script:", tabs[0].id);
//       chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_BRANDING", url: message.url }, (response) => {
//         if (chrome.runtime.lastError) {
//           console.error("Error sending message:", chrome.runtime.lastError.message);
//         } else {
//           console.log("Message successfully sent!", response);
//         }
//       });
//     });
//   } else {
//     console.error("❌ No valid tab found or unsupported URL:", tabs.length > 0 ? tabs[0].url : "No tabs open");
//   }
// });


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
    chrome.runtime.sendMessage({ type: "WEB_BRANDING", payload: brandingData });
    sendResponse({ success: true }); 
  } else if (message.type === "GET_BRANDING") {
    console.log("Sending branding data:", brandingData);
    sendResponse(brandingData); 
  } else  if (message.type === "EXTENSION_NAVIGATE" && message.url) {
    chrome.runtime.sendMessage({
      type: "UPDATE_EXTENSION_UI",
      url: message.url
    });
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
