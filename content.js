window.addEventListener("load", () => {
  const params = new URLSearchParams(location.search);
  const serviceName = params.get("serviceName");
  const transactionId = params.get("transactionId");
  const serviceTypeId = params.get("serviceTypeId");
  const action = params.get("action");

  if (serviceName && transactionId && serviceTypeId && action) {
    const started = Date.now();
    const timer = setInterval(() => {
      if (typeof window.viewServiceTaskData_cs === "function") {
        try { window.viewServiceTaskData_cs(serviceName, transactionId, serviceTypeId, action); } catch (e) {}
        clearInterval(timer);
      } else if (Date.now() - started > 10000) {
        clearInterval(timer);
      }
    }, 300);
  }

  ensureShowDocuments();
});

function ensureShowDocuments() {
  const started = Date.now();
  const poll = setInterval(() => {
    if (tryClickShowDocuments(document)) { clearInterval(poll); return; }
    const iframes = Array.from(document.querySelectorAll("iframe"));
    for (const f of iframes) {
      try {
        const d = f.contentWindow && f.contentWindow.document;
        if (d && tryClickShowDocuments(d)) { clearInterval(poll); return; }
      } catch (e) {}
    }
    if (Date.now() - started > 20000) { clearInterval(poll); }
  }, 400);
}

function tryClickShowDocuments(root) {
  let el = root.getElementById("showDocumentBtnId");
  if (el) { try { el.click(); } catch (e) {} return true; }

  el = root.querySelector('[id*="showdocument"], [id*="showDoc"], [aria-label*="Show Document" i]');
  if (el) { try { el.click(); } catch (e) {} return true; }

  const candidates = root.querySelectorAll("button, a, [role='button'], .btn, .button");
  for (const c of candidates) {
    const t = (c.textContent || "").trim().toLowerCase();
    if (!t) continue;
    if (t.includes("show document") || t.includes("show documents")) { try { c.click(); } catch (e) {} return true; }
  }
  return false;
}
