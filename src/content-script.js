function extractPageData() {
  const title = document.querySelector('title')?.innerText || 'No title available';
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const description = descriptionMeta ? descriptionMeta.getAttribute('content') : 'No description available';

  // Get all links but only those matching the same origin
  const origin = window.location.origin;
  const links = Array.from(document.querySelectorAll('a[href]'))
    .map(a => {
      try {
        const href = a.getAttribute('href')?.trim(); // Get and trim the href

        // Ensure href is not empty or invalid
        if (!href || href.startsWith('javascript:') || href === '#') {
          return null;
        }

        // Convert relative URLs to absolute
        const absoluteUrl = new URL(href, document.baseURI).href;

        return { url: absoluteUrl, name: a.innerText.trim() || "No text available" };
      } catch (error) {
        return null; // Skip invalid URLs
      }
    })
    .filter(link => link && new URL(link.url).origin === origin); // Only keep valid links on the same origin


  chrome.runtime.sendMessage({
    type: 'WEB_BRANDING',
    payload: { title, description, links }
  });
}

// Listen for updates from the background script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "UPDATE_BRANDING") {
    extractPageData(); // Re-extract data when navigation happens
  }
});

// Run on initial page load
extractPageData();


  


