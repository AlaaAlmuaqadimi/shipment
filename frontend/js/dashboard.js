"use strict";

// بيانات تجريبية (Front فقط)
window.AppData = window.AppData || {
  exchangeRate: 7.0,
  orders: [],
  batches: []
};

function formatMoney(v) {
  return (Number(v || 0)).toFixed(2) + " د.ل";
}

function renderStatusPill(status) {
  if (status === "pending") return '<span class="status-pill status-pending">معلقة</span>';
  if (status === "delivered") return '<span class="status-pill status-done">مستلمة</span>';
  if (status === "cancelled") return '<span class="status-pill status-cancelled">ملغاة</span>';
  return status || "-";
}

function renderDashboard() {
  const { orders, batches } = window.AppData;

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const totalProfit = deliveredOrders.reduce((s, o) => s + (o.profitLyd || 0), 0);

  const a = document.getElementById("stat-total-orders");
  const b = document.getElementById("stat-pending-orders");
  const c = document.getElementById("stat-total-profit");
  if (a) a.textContent = totalOrders;
  if (b) b.textContent = pendingOrders;
  if (c) c.textContent = formatMoney(totalProfit);

  const latestBody = document.getElementById("dashboard-latest-orders");
  if (latestBody) {
    latestBody.innerHTML = "";
    orders.slice(-5).reverse().forEach(o => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${o.product || "-"}</td>
        <td>${o.customer || "-"}</td>
        <td>${formatMoney(o.profitLyd || 0)}</td>
        <td>${renderStatusPill(o.status)}</td>
      `;
      latestBody.appendChild(tr);
    });
  }

  const batchesBody = document.getElementById("dashboard-batches");
  if (batchesBody) {
    batchesBody.innerHTML = "";
    batches.forEach(x => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${x.id}</td>
        <td>${x.ordersCount || 0}</td>
        <td>${formatMoney(x.totalProfit || 0)}</td>
        <td>${x.status === "open"
            ? '<span class="status-pill status-pending">مفتوحة</span>'
            : '<span class="status-pill status-done">مغلقة</span>'
          }</td>
      `;
      batchesBody.appendChild(tr);
    });
  }

  const goAdd = document.getElementById("goAddOrder");
  if (goAdd) {
    goAdd.onclick = () => (location.hash = "#orders");
  }
}

window.addEventListener("page:loaded", (e) => {
  if (e.detail.route === "dashboard") renderDashboard();
});
