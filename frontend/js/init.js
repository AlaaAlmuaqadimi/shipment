// =============================
// QS System - init.js
// =============================

// ========= INIT =========
function init() {
  loadBatchesFromStorage();

  // sync rate badge from settings
  const settingsRateInput = document.getElementById("settings-rate");
  exchangeRate = parseFloat(settingsRateInput.value) || 7.0;
  document.getElementById("current-rate-badge").textContent = exchangeRate.toFixed(2);

  // ✅ اربط عناصر الفورم بعد تحميل الصفحات
  if (typeof bindOrderFormElements === "function") bindOrderFormElements();

  renderDashboardStats();
  renderOrdersTable();
  renderBatchesTable();
  renderAnalytics();
  renderUsersTable();
  renderBlockedTable();

  // ✅ الآن آمن
  recalcOrderTotals();
}
