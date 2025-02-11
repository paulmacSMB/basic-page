chrome.runtime.onInstalled.addListener(function () {
    console.log('Extension installed and background script initialized.');
});

// chrome.action.onClicked.addListener((tab) => {
//     chrome.scripting.executeScript({
//       target: { tabId: tab.id },
//       files: ['content-script.js']
//     });
//   });
  