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
        const btnTimer = setInterval(() => {
          const btn = document.getElementById("showDocumentBtnId");
          if (btn) { try { btn.click(); } catch (e) {} clearInterval(btnTimer); }
        }, 400);
      } else if (Date.now() - started > 8000) {
        clearInterval(timer);
      }
    }, 300);
    return;
  }

  setTimeout(() => {
    const btn = document.getElementById("showDocumentBtnId");
    if (btn) {
      try { btn.click(); } catch (e) {}
    }
  }, 800);
});
