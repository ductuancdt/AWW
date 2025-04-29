
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get_cpu') {
    fetch('https://wax.greymass.com/v1/chain/get_account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_name: message.account })
    })
    .then(res => res.json())
    .then(data => sendResponse({ data }))
    .catch(err => sendResponse({ error: err.toString() }));

    return true; // Cho phép sendResponse async
  }

  if (message.type === 'set-proxy') {
    const config = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: message.data.scheme,
          host: message.data.host,
          port: parseInt(message.data.port)
        }
      }
    };
    chrome.proxy.settings.set({ value: config, scope: 'regular' }, () => {
      if (message.data.username && message.data.password) {
        if (chrome.webRequest && chrome.webRequest.onAuthRequired) {
          chrome.webRequest.onAuthRequired.addListener(
            function(details) {
              return { 
                authCredentials: { 
                  username: message.data.username, 
                  password: message.data.password 
                } 
              };
            },
            { urls: ["<all_urls>"] },
            ['blocking']
          );
        } else {
          console.error('webRequest.onAuthRequired is not available.');
        }
      }
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'clear-proxy') {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
  