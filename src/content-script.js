// Extract the website's title
const title = document.querySelector('title')?.innerText || 'No title available';

// Extract the website's description from meta tags
const descriptionMeta = document.querySelector('meta[name="description"]');
const description = descriptionMeta ? descriptionMeta.getAttribute('content') : 'No description available';

// Extract the website's logo (common practices)
let logo = document.querySelector('link[rel="icon"]')?.href ||
           document.querySelector('link[rel="shortcut icon"]')?.href ||
           document.querySelector('link[rel="apple-touch-icon"]')?.href ||
           '/favicon.ico'; // Default to favicon

// Send the extracted data to the Angular app
window.postMessage({
  type: 'WEB_BRANDING',
  payload: { title, description, logo }
}, '*');
