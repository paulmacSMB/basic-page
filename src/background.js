let brandingData = {};

chrome.action.onClicked.addListener(() => {
  chrome.windows.create({
    url: chrome.runtime.getURL("index.html"), // Load your Angular UI here
    type: "popup",
    width: 1000,
    height: 1200,
  });
});

// user switches tabs
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log("Switched to tab:", tab);
    chrome.tabs.sendMessage(tab.id, { type: "UPDATE_BRANDING" });
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'WEB_BRANDING') {
    brandingData = message.payload;
    console.log("getting data in background", brandingData);
  }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_BRANDING') {
      console.log("sending data in background", brandingData);
      sendResponse(brandingData);
      return true;
    }
  });
  