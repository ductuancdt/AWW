// Hàm kiểm tra trạng thái Proxy (IP hiện tại và Proxy)
function checkProxyStatus() {
  fetch('https://api.myip.com')
    .then(res => res.json())
    .then(data => {
      chrome.storage.local.get(['proxyIP'], (result) => {
        const proxyIP = result.proxyIP;
        const currentIP = data.ip;

        let status = "gray"; // Mặc định là không kết nối
        if (!proxyIP) {
          status = "gray"; // Không kết nối Proxy
        } else if (!currentIP) {
          status = "red"; // Không có mạng
        } else if (currentIP !== proxyIP) {
          status = "yellow"; // IP không trùng với Proxy
        } else {
          status = "green"; // Proxy kết nối OK và IP đúng
        }

        // Cập nhật trạng thái vào chrome.storage
        chrome.storage.local.set({ proxyStatus: status, proxyIP: currentIP });
        
        // Cập nhật icon trạng thái
        updateExtensionIcon(status);
      });
    })
    .catch(() => {
      // Nếu gặp lỗi trong việc kiểm tra IP, gán trạng thái lỗi
      chrome.storage.local.set({ proxyStatus: "red" });
      updateExtensionIcon("red");
    });
}

// Hàm cập nhật icon trạng thái
function updateExtensionIcon(status) {
  let color = 'gray', text = '';
  if (status === "green") { color = "#4CAF50"; text = "✔"; }
  if (status === "red") { color = "#F44336"; text = "!"; }
  if (status === "yellow") { color = "#FFC107"; text = "?"; }
  if (status === "gray") { color = "#9E9E9E"; text = "-"; }

  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeText({ text });
}

// Kiểm tra proxy mỗi 60 giây
setInterval(checkProxyStatus, 60000);

// Xử lý các message từ extension khác (set proxy, clear proxy)
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
      chrome.storage.local.set({ proxyIP: message.data.host }, () => {
        console.log("Proxy IP đã được lưu:", message.data.host);
      });
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
      chrome.storage.local.set({ proxyIP: '' }, () => {
        console.log("Proxy IP đã được clear");
      });
      sendResponse({ success: true });
    });
    return true;
  }
});
  