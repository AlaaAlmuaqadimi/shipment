// =============================
// QS System - analytics.js
// =============================

// ========= DASHBOARD =========
function getBatchesWithTotals() {
  return batches.map(b => {
    const batchOrders = orders.filter(o => o.batchId === b.id);

    const totalCost = batchOrders.reduce((sum, o) => sum + (Number(o.costLyd) || 0), 0);
    const totalSell = batchOrders.reduce((sum, o) => sum + (Number(o.sellLyd) || 0), 0);

    // الربح "الخام" = مجموع أرباح الطلبات داخل الشحنة
    const grossProfit = batchOrders.reduce((sum, o) => sum + (Number(o.profitLyd) || 0), 0);

    // ✅ المصاريف الخاصة على الشحنة
    const extraCosts = Number(b.batchExtraCostsLyd || 0);

    // ✅ الربح النهائي للشحنة = الربح الخام - المصاريف الخاصة
    const netProfit = grossProfit - extraCosts;

    return {
      ...b,
      ordersCount: batchOrders.length,
      totalCost,
      totalSell,
      grossProfit,
      extraCosts,
      netProfit
    };
  });
}

function renderDashboardStats() {
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const totalProfitDelivered = deliveredOrders.reduce((sum, o) => sum + (Number(o.profitLyd) || 0), 0);

  document.getElementById("stat-total-orders").textContent = totalOrders;
  document.getElementById("stat-pending-orders").textContent = pendingOrders;
  document.getElementById("stat-total-profit").textContent = formatMoney(totalProfitDelivered || 0);

  const latestBody = document.getElementById("dashboard-latest-orders");
  latestBody.innerHTML = "";
  orders.slice(-5).reverse().forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.product}</td>
      <td>${o.customer}</td>
      <td>${formatMoney(o.profitLyd)}</td>
      <td>${renderStatusPill(o.status)}</td>
    `;
    latestBody.appendChild(tr);
  });

  const dashBatchesBody = document.getElementById("dashboard-batches");
  dashBatchesBody.innerHTML = "";
  getBatchesWithTotals().forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.ordersCount}</td>
      <td>${formatMoney(b.netProfit)}</td>
      <td>${renderBatchStatusPill(b.status)}</td>
    `;
    dashBatchesBody.appendChild(tr);
  });
}

// ========= ANALYTICS =========
function renderAnalytics() {
  const byBatchBody = document.getElementById("analytics-by-batch");
  byBatchBody.innerHTML = "";

  const batchesTotals = getBatchesWithTotals();

  // جدول حسب الشحنة (يعرض المصاريف والربح بعد الخصم)
  batchesTotals.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.ordersCount}</td>
      <td>${formatMoney(b.extraCosts)}</td>
      <td>${formatMoney(b.netProfit)}</td>
    `;
    byBatchBody.appendChild(tr);
  });

  // ربح الطلبات المستلمة فقط (كما عندك)
  const deliveredOrders = orders.filter(o => o.status === "delivered");
  const deliveredProfit = deliveredOrders.reduce((sum, o) => sum + (Number(o.profitLyd) || 0), 0);

  // ✅ مجموع المصاريف الخاصة للشحنات (كلها)
  const totalBatchExtra = batches.reduce((sum, b) => sum + (Number(b.batchExtraCostsLyd) || 0), 0);

  // ✅ الربح بعد خصم المصاريف الخاصة
  const netAfterBatchExtra = deliveredProfit - totalBatchExtra;

  // حقولك القديمة
  const totalCost = deliveredOrders.reduce((sum, o) => sum + (Number(o.costLyd) || 0), 0);
  const totalSell = deliveredOrders.reduce((sum, o) => sum + (Number(o.sellLyd) || 0), 0);
  const avgProfit = deliveredOrders.length ? deliveredProfit / deliveredOrders.length : 0;

  document.getElementById("analytics-total-cost").value = formatMoney(totalCost || 0);
  document.getElementById("analytics-total-sell").value = formatMoney(totalSell || 0);
  document.getElementById("analytics-total-profit").value = formatMoney(deliveredProfit || 0);
  document.getElementById("analytics-avg-profit").value = formatMoney(avgProfit || 0);

  // ✅ NEW fields (لازم تكون موجودة في HTML)
  const extraEl = document.getElementById("analytics-total-batch-extra");
  const netEl = document.getElementById("analytics-net-profit-after-batch-extra");
  if (extraEl) extraEl.value = formatMoney(totalBatchExtra || 0);
  if (netEl) netEl.value = formatMoney(netAfterBatchExtra || 0);
}
