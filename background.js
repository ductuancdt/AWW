// Hiện tại không cần gì ở đây
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'get_cpu') {
      fetch('https://wax.greymass.com/v1/chain/get_account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: request.account })
      })
      .then(res => res.json())
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.toString() }));
  
      return true; // Cho phép sendResponse async
    }
  });
  