
function parseProxyString(proxyString) {
  proxyString = proxyString.trim();
  if (proxyString.startsWith('[')) {
    const closingIndex = proxyString.indexOf(']');
    if (closingIndex === -1) {
      throw new Error('Invalid IPv6 format. Missing closing bracket.');
    }
    const ipv6 = proxyString.substring(1, closingIndex);
    const remaining = proxyString.substring(closingIndex + 1).split(':').filter(Boolean);
    const port = remaining[0];
    const username = remaining[1] || null;
    const password = remaining[2] || null;
    return { host: ipv6, port, username, password };
  } else {
    const parts = proxyString.split(':');
    const [host, port, username, password] = parts;
    return { host, port, username: username || null, password: password || null };
  }
}

document.getElementById('set-proxy').addEventListener('click', async () => {
  const scheme = document.getElementById('scheme').value;
  const proxyString = document.getElementById('proxyString').value.trim();
  if (!proxyString) { showStatus('Please enter a proxy string.', 'red'); return; }
  let proxyData;
  try {
    proxyData = parseProxyString(proxyString);
  } catch (error) {
    showStatus(error.message, 'red');
    return;
  }
  chrome.runtime.sendMessage({ type: 'set-proxy', data: { scheme, ...proxyData } }, (response) => {
    if (response.success) {
      showStatus('Proxy Set Successfully!', 'green');
      chrome.storage.local.set({ savedProxy: { proxyString, scheme } });
    } else {
      showStatus('Failed to set proxy.', 'red');
    }
  });
});

document.getElementById('clear-proxy').addEventListener('click', async () => {
  chrome.runtime.sendMessage({ type: 'clear-proxy' }, (response) => {
    if (response.success) {
      showStatus('Proxy Cleared!', 'green');
      chrome.storage.local.remove('savedProxy');
      document.getElementById('proxyString').value = '';
    }
  });
});

function showStatus(message, color) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = color;
}

window.onload = function() {
  chrome.storage.local.get('savedProxy', (data) => {
    if (data.savedProxy) {
      document.getElementById('proxyString').value = data.savedProxy.proxyString || '';
      document.getElementById('scheme').value = data.savedProxy.scheme || 'http';
    }
  });
};
