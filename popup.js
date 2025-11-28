const statusEl = document.getElementById("status");
function setStatus(msg, error) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = error ? "#d9534f" : "#222";
}

function runOpen(count) {
  chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const tab = tabs && tabs[0];
    if (!tab || !tab.id) { setStatus("No active tab", true); return; }
    try {
      const host = new URL(tab.url || "").hostname.toLowerCase();
      if (!host.includes("newsnoc")) { setStatus("Open newsnoc page", true); return; }
    } catch (e) { setStatus("Open newsnoc page", true); return; }
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: collectContractUrls,
      args: [count]
    }, async (res) => {
      if (chrome.runtime.lastError) { setStatus("Injection error", true); return; }
      const urls = (res && res[0] && res[0].result) || [];
      if (!urls.length) { setStatus("No contracts", true); return; }
      setStatus("Opening...");
      for (let i = 0; i < urls.length; i++) {
        try { await chrome.tabs.create({ url: urls[i], active: false }); } catch (e) {}
        await new Promise(r => setTimeout(r, 250));
      }
      setStatus("Done");
    });
  });
}

const goBtn = document.getElementById("goBtn");
if (goBtn) {
  goBtn.addEventListener("click", () => {
    const count = parseInt(document.getElementById("count").value, 10);
    if (isNaN(count) || count <= 0) { setStatus("Enter a valid number", true); return; }
    runOpen(count);
  });
}

const openBtn = document.getElementById("openBtn");
if (openBtn) {
  openBtn.addEventListener("click", () => {
    const count = parseInt(document.getElementById("count").value, 10);
    if (isNaN(count) || count <= 0) { alert("Enter a valid number"); return; }
    runOpen(count);
  });
}

const scanBtn = document.getElementById("scanBtn");
if (scanBtn) {
  scanBtn.addEventListener("click", () => {
    setStatus("Scanning...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs && tabs[0];
      if (!tab || !tab.id) { setStatus("No active tab", true); return; }
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scanForContracts
      }, (res) => {
        if (chrome.runtime.lastError) { setStatus("Scan error", true); return; }
        const count = res && res[0] && res[0].result || 0;
        document.getElementById("count").value = count || "";
        setStatus(count ? `Found ${count}` : "No contracts", !count);
      });
    });
  });
}

function isValidUrlCandidate(href) {
  if (!href) return false;
  const lower = href.trim().toLowerCase();
  if (lower === "#" || lower === "javascript:void(0)" || lower.startsWith("javascript:")) return false;
  return true;
}

async function openContracts(count) {
  const rows = document.getElementsByClassName("ui-widget-content jqgrow ui-row-ltr");
  let opened = 0;

  for (const row of rows) {
    if (opened >= count) break;

    const candidates = Array.from(row.querySelectorAll("a[href]"));
    let urlToOpen = null;
    for (const a of candidates) {
      const href = a.getAttribute("href");
      if (!isValidUrlCandidate(href)) continue;
      const h = href.toLowerCase();
      const looksLikeDoc = h.includes("document") || h.includes("contract") || h.includes("showdoc") || h.includes("showdocument") || h.includes("edit");
      if (looksLikeDoc) {
        try {
          urlToOpen = new URL(href, location.href).href;
        } catch {
          urlToOpen = href;
        }
        break;
      }
    }

    if (urlToOpen) {
      window.open(urlToOpen, "_blank");
      opened++;
      await new Promise(r => setTimeout(r, 150));
      continue;
    }

    const icon = row.querySelector("i.icon-edit");
    if (icon) {
      let link = icon.closest("a");
      if (!link) link = row.querySelector('a[onclick*="viewServiceTaskData_cs"]');
      if (link) {
        const onclick = link.getAttribute("onclick") || "";
        const args = Array.from(onclick.matchAll(/"([^"]*)"/g)).map(m => m[1]);
        if (args.length >= 4) {
          const base = "https://newsnoc/uiSNOC/main/service?cat=viewTaskPage_cs";
          const u = `${base}&serviceName=${encodeURIComponent(args[0])}&transactionId=${encodeURIComponent(args[1])}&serviceTypeId=${encodeURIComponent(args[2])}&action=${encodeURIComponent(args[3])}`;
          window.open(u, "_blank");
          opened++;
          await new Promise(r => setTimeout(r, 200));
          continue;
        }
      }
    }
  }

  alert("Opened " + opened + " contracts");
}

function scanForContracts() {
  const rows = document.getElementsByClassName("ui-widget-content jqgrow ui-row-ltr");
  let count = 0;
  for (const row of rows) {
    const icon = row.querySelector("i.icon-edit");
    let link = icon ? icon.closest("a") : null;
    if (!link) link = row.querySelector('a[onclick*="viewServiceTaskData_cs"]');
    if (link) count++;
  }
  return count;
}

function collectContractUrls(count) {
  const rows = document.getElementsByClassName("ui-widget-content jqgrow ui-row-ltr");
  const urls = [];
  for (const row of rows) {
    if (urls.length >= count) break;
    const icon = row.querySelector("i.icon-edit");
    let link = icon ? icon.closest("a") : null;
    if (!link) link = row.querySelector('a[onclick*="viewServiceTaskData_cs"]');
    if (!link) continue;
    const onclick = link.getAttribute("onclick") || "";
    const args = Array.from(onclick.matchAll(/"([^"]*)"/g)).map(m => m[1]);
    if (args.length >= 4) {
      const base = "https://newsnoc/uiSNOC/main/service?cat=viewTaskPage_cs";
      const u = `${base}&serviceName=${encodeURIComponent(args[0])}&transactionId=${encodeURIComponent(args[1])}&serviceTypeId=${encodeURIComponent(args[2])}&action=${encodeURIComponent(args[3])}`;
      urls.push(u);
    }
  }
  return urls;
}
