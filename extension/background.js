chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only trigger when the page has fully loaded and is a real website
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    
    console.log("Snitching on:", tab.url);

    // Send the URL to the FastAPI backend
    fetch('https://outcognito-mode.onrender.com/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: tab.url,
        title: tab.title || "Unknown Title"
      })
    }).catch(err => console.error("Failed to snitch:", err));
  }
});