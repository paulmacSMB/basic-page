function extractBrandingData() {
    const title = document.querySelector('title')?.innerText || 'No title available';
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const description = descriptionMeta ? descriptionMeta.getAttribute('content') : 'No description available';
  
    chrome.runtime.sendMessage({
      type: 'WEB_BRANDING',
      payload: { title, description }
    });
  }
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "UPDATE_BRANDING") {
      extractBrandingData(); // Re-extract data when the tab changes
    }
  });
  
  // Run on initial page load
  extractBrandingData();
  


