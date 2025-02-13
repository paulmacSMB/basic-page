function extractPageData() {
  const title = document.querySelector('title')?.innerText || 'No title available';
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const description = descriptionMeta ? descriptionMeta.getAttribute('content') : 'No description available';

  const origin = window.location.origin;
  const links = [...document.querySelectorAll("a")].map((a) => {
    try {
      let href = a.getAttribute('href')?.trim(); // Get and trim href

      // Ensure href is valid and not empty, '#' or JavaScript links
      if (!href || href.startsWith('javascript:') || href === '#' || href === '/') {
        return null;
      }

      // Convert relative URL to absolute safely
      let absoluteUrl;
      if (/^https?:\/\//i.test(href)) {
        absoluteUrl = href;
      } else {
        absoluteUrl = new URL(href, document.baseURI).href;
      }

      // Set security attributes to open links safely
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");

      return {
        url: absoluteUrl,
        name: a.innerText.trim() || "No text available",
        description: a.title || "No description available",
      };
    } catch (error) {
      console.error(`Invalid URL: ${a.href}`, error);
      return null; // Skip invalid links
    }
  }).filter(link => link !== null && new URL(link.url).origin === origin);

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



  


