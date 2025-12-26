// =============================
// QS System - core.js
// =============================

// ========= GLOBAL EXCHANGE RATE =========
let exchangeRate = 7.0;

// ========= OPTIONS =========
const ENABLE_BLOCKED_CHECK = false;

// ========= LOCAL STORAGE KEYS =========
const LS_KEYS = {
  batches: "qs_batches_v2" // رفعت النسخة عشان ما تلخبط مع القديم
};

// ========= HELPERS =========
function formatMoney(v) {
  return (Number(v) || 0).toFixed(2) + " د.ل";
}

function safeText(v) {
  return (v === null || v === undefined || v === "") ? "-" : String(v);
}

function renderStatusPill(status) {
  if (status === "pending") return '<span class="status-pill status-pending">معلقة</span>';
  if (status === "delivered") return '<span class="status-pill status-done">مستلمة</span>';
  if (status === "cancelled") return '<span class="status-pill status-cancelled">ملغاة</span>';
  return status;
}

function renderBatchStatusPill(status) {
  if (status === "open") return '<span class="status-pill status-pending">مفتوحة</span>';
  if (status === "closed") return '<span class="status-pill status-done">مغلقة</span>';
  return status;
}

function normalizePhone(p) {
  return String(p || "").replace(/\s+/g, "").trim();
}

// ========= LOADERS =========
async function loadHTML(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("Failed to load: " + path);
  return await res.text();
}

async function mountComponent(slotId, path) {
  const slot = document.getElementById(slotId);
  if (!slot) throw new Error("Missing slot: #" + slotId);
  slot.innerHTML = await loadHTML(path);
}

async function mountPage(containerId, path) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error("Missing container: #" + containerId);
  const html = await loadHTML(path);
  container.insertAdjacentHTML("beforeend", html);
}

// ========= NAV =========
let navButtons = [];

function openPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const pageEl = document.getElementById(pageId);
  if (pageEl) pageEl.classList.add("active");

  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.page === pageId));
}

function wireNav() {
  navButtons = Array.from(document.querySelectorAll(".nav-btn"));
  navButtons.forEach(btn => btn.addEventListener("click", () => openPage(btn.dataset.page)));
}

// ========= BOOTSTRAP =========
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await mountComponent("header-slot", "components/header.html"); 
    await mountComponent("modals-slot", "components/modals.html");

    await mountPage("app-content", "pages/dashboard.html");
    await mountPage("app-content", "pages/orders.html");
    await mountPage("app-content", "pages/batches.html");
    await mountPage("app-content", "pages/analytics.html");
    await mountPage("app-content", "pages/blocked.html");
    await mountPage("app-content", "pages/settings.html");
    await mountPage("app-content", "pages/users.html");

    wireNav();
    openPage("dashboard");

    // ✅ بعد ما الصفحات تتحقن في DOM شغّل init()
    if (typeof init === "function") init();

  } catch (e) {
    console.error(e);
    document.body.innerHTML =
      "<pre style='direction:ltr; padding:16px; color:#fff; background:#111;'>" +
      String(e.stack || e) +
      "</pre>";
  }
});

wireNav();
openPage("dashboard");

// ✅ بعد ما الصفحات تتحقن في DOM شغّل init()
if (typeof init === "function") init();
