window.addEventListener("load", () => {
  const params = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams((location.hash || "").replace(/^#/, ""));
  const serviceName = params.get("serviceName") || hashParams.get("serviceName");
  const transactionId = params.get("transactionId") || hashParams.get("transactionId");
  const serviceTypeId = params.get("serviceTypeId") || hashParams.get("serviceTypeId");
  const action = params.get("action") || hashParams.get("action") || "edit";

  const hasParams = !!(serviceName && transactionId && serviceTypeId && action);
  if (hasParams) {
    const started = Date.now();
    const timer = setInterval(() => {
      let called = false;
      if (typeof window.viewServiceTaskData_cs === "function") {
        try { window.viewServiceTaskData_cs(serviceName, transactionId, serviceTypeId, action); called = true; } catch (e) {}
      }
      if (!called) {
        const iframes = Array.from(document.querySelectorAll("iframe"));
        for (const f of iframes) {
          try {
            const w = f.contentWindow;
            if (w && typeof w.viewServiceTaskData_cs === "function") {
              try { w.viewServiceTaskData_cs(serviceName, transactionId, serviceTypeId, action); called = true; } catch (e) {}
              break;
            }
          } catch (e) {}
        }
      }
      if (called) { clearInterval(timer); }
      else if (Date.now() - started > 30000) { clearInterval(timer); }
    }, 300);
  }

  ensureShowDocuments();
  injectMainScript();
  injectI();
  if (!hasParams) { autoClickEdit(); }
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

function injectMainScript(){
  try{
    const s=document.createElement('script');
    s.src=chrome.runtime.getURL('inject.js');
    s.type='text/javascript';
    s.onload=function(){ if(s.parentNode) s.parentNode.removeChild(s); };
    (document.documentElement||document.head||document.body).appendChild(s);
  }catch(e){}
}

function injectI(){
  try{
    const s=document.createElement('script');
    s.src=chrome.runtime.getURL('i.js');
    s.type='text/javascript';
    s.onload=function(){ if(s.parentNode) s.parentNode.removeChild(s); };
    (document.head||document.documentElement).appendChild(s);
  }catch(e){}
}

function autoClickEdit(){
  const started = Date.now();
  const poll = setInterval(() => {
    if (tryClickEdit(document)) { clearInterval(poll); return; }
    const iframes = Array.from(document.querySelectorAll("iframe"));
    for (const f of iframes) {
      try {
        const d = f.contentWindow && f.contentWindow.document;
        if (d && tryClickEdit(d)) { clearInterval(poll); return; }
      } catch (e) {}
    }
    if (Date.now() - started > 20000) { clearInterval(poll); }
  }, 400);
}

function tryClickEdit(root){
  let el = root.querySelector("i.icon-edit");
  if (el) {
    const link = el.closest('a');
    if (link) { try { link.click(); } catch (e) {} return true; }
  }
  el = root.querySelector('a[title*="Edit" i], a[title*="Edit Data" i]');
  if (el) { try { el.click(); } catch (e) {} return true; }
  const candidates = root.querySelectorAll("button, a, [role='button'], .btn, .button");
  for (const c of candidates) {
    const t = (c.textContent || "").trim().toLowerCase();
    if (!t) continue;
    if (t.includes("edit") || t.includes("edit data")) { try { c.click(); } catch (e) {} return true; }
  }
  return false;
}
