// window.__contentScriptInjected = true; // Prevent multiple injections

function extractPageData()   {
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
  if (message.type === "UPDATE_PAGE_SECTION" && message.url) {
    console.log("Navigating webpage to:", message.url);
    window.location.href = message.url;  // Or update the section content dynamically
    sendResponse({ success: true });
  }
});

// chrome.runtime.sendMessage({ type: "CONTENT_SCRIPT_LOADED" });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  if (message.type === "UPDATE_BRANDING" && message.url) {
    console.log("Processing UPDATE_BRANDING");
   
    setTimeout(() => {
      window.location.href = message.url; // navigator for webpage
      extractPageData();
      sendResponse({ status: "✅ Branding updated!" });
    }, 500);
  }
});

// Run on initial page load
extractPageData();



