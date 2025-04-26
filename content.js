function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
function randomDelay(min = 1000, max = 300000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getWaxCpuUsage(accountName) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'get_cpu', account: accountName }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Extension error:', chrome.runtime.lastError.message);
        reject(-1);
      } else if (response.error) {
        console.error('Fetch error:', response.error);
        reject(-1);
      } else {
        const cpuUsed = response.data.cpu_limit.used;
        const cpuMax = response.data.cpu_limit.max;
        const cpuPct = ((cpuUsed / cpuMax) * 100).toFixed(2);
        console.log(`Account: ${accountName}`);
        console.log(`CPU Used: ${cpuUsed} µs`);
        console.log(`CPU Max: ${cpuMax} µs`);
        console.log(`CPU Usage: ${cpuPct}%`);
        resolve(cpuPct);
      }
    });
  });
}

async function autoClickButtons() {
  if (isRunning) return;
  isRunning = true;

  try{
    const mineButton = [...document.querySelectorAll("button")].find(btn =>
      btn.innerText.trim().toLowerCase() === "mine"
    );
  
    if (mineButton) {
      console.log("⛏️ Click Mine");
      const delayMs = randomDelay();
      console.log(`⏳ Đợi ${delayMs}ms sau khi click Mine`);
      await delay(delayMs);
  
      const cpuPct = await getWaxCpuUsage('nzobg.wam');
      if (cpuPct < 95) {
        mineButton.click();
      } else {
        console.log("⏳ CPU usage is high, waiting for cooldown...");
        const cooldownMs = randomDelay(30*60*1000, 40*60*3000);
        console.log(`⏳ Đợi ${cooldownMs}ms trước khi thử lại`);
        await delay(cooldownMs);
      }
      
    }
  
    const submitButton = [...document.querySelectorAll("button")].find(btn =>
      btn.innerText.trim().toLowerCase() === "submit"
    );
  
    if (submitButton) {
      console.log("📤 Click Submit");
      const delayMs = randomDelay(1000, 3000);
      console.log(`⏳ Đợi ${delayMs}ms sau khi click Submit`);
      await delay(delayMs);
      submitButton.click();
    }
  
    const approvalButton = [...document.querySelectorAll("button")].find(btn =>
      btn.innerText.trim().toLowerCase() === "approve"
    );
  
    if (approvalButton) {
      console.log("📤 Click approve");
      const delayMs = randomDelay(1000, 3000);
      console.log(`⏳ Đợi ${delayMs}ms sau khi click approve`);
      await delay(delayMs);
      approvalButton.click();
    }
  } finally {
    isRunning = false;
  }
  
}

let isRunning = false;
// Quan sát thay đổi DOM để tìm nút mới xuất hiện
let debounceTimeout;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    autoClickButtons();
  }, 500); // chỉ gọi sau 500ms nếu không có thay đổi thêm
});

// Bắt đầu theo dõi body
observer.observe(document.body, { childList: true, subtree: true });

// Kiểm tra lần đầu sau khi trang tải xong
window.addEventListener("load", () => {
  autoClickButtons();
});
  