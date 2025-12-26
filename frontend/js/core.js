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

// ========= NAV =========
const navButtons = document.querySelectorAll(".nav-btn");
function openPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  navButtons.forEach(btn => btn.classList.toggle("active", btn.dataset.page === pageId));
}
navButtons.forEach(btn => btn.addEventListener("click", () => openPage(btn.dataset.page)));
