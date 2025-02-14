window.__contentScriptInjected = true; // Prevent multiple injections

function extractPageData() {
  if (window.location.protocol === "chrome-extension:") {
    console.warn("Skipping extraction on extension pages.");
    return;
  }

  const title = document.querySelector("title")?.innerText || "No title available";
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const description = descriptionMeta ? descriptionMeta.getAttribute("content") : "No description available";

  const origin = window.location.origin;
  const links = [...document.querySelectorAll("a")]
    .map((a) => ({
      url: a.href,
      name: a.innerText.trim() || "No text available",
      description: a.title || "No description available",
    }))
    .filter(link => link !== null && new URL(link.url).origin === origin);

  console.log("links:", links);
  chrome.runtime.sendMessage({
    type: "WEB_BRANDING",
    payload: { title, description, links }
  });
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Received message in content script:", message);

  if (message.type === "UPDATE_BRANDING") {
    extractPageData();
  }

  // sendResponse({ received: true }); // ✅ Always acknowledge the message
});

// Run on initial page load
extractPageData();



