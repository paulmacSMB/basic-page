function extractBrandingAndLinks() {
  // Extract page title and description
  const title = document.querySelector('title')?.innerText || 'No title available';
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const description = descriptionMeta ? descriptionMeta.getAttribute('content') : 'No description available';

  // Extract hyperlinks
  const links = [...document.querySelectorAll("a")].map((a) => ({
    url: a.href,
    name: a.innerText.trim() || "No text available",
    description: a.title || "No description available",
  }));

  // Send branding and link data to the background script
  chrome.runtime.sendMessage({
    type: "PAGE_DATA",
    payload: { title, description, links },
  });
}

// message listener for multiple updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "UPDATE_PAGE_DATA") {
    extractBrandingAndLinks(); // Re-extract when requested
  }
});

// Run on initial page load
extractBrandingAndLinks();

  


