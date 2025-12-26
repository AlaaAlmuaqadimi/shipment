// =============================
// QS System - orders.js
// =============================

// ========= DUMMY DATA =========
const orders = [
  {
    id: 1,
    product: "حذاء نايك",
    customer: "أحمد علي",
    phone: "0911111111",
    address: "طرابلس - زاوية الدهماني",
    batchId: "B-1001",
    delegate: "محمد المندوب",
    gbpBuy: 20,
    gbpSell: 25,
    costLyd: 20 * 7,
    sellLyd: 25 * 7,
    profitGbp: 25 - 20,
    profitLyd: 25 * 7 - 20 * 7,
    status: "delivered"
  },
  {
    id: 2,
    product: "شنطة يد",
    customer: "سارة محمد",
    phone: "0922222222",
    address: "بنغازي - الفويهات",
    batchId: "B-1001",
    delegate: "ليلى",
    gbpBuy: 15,
    gbpSell: 22,
    costLyd: 15 * 7,
    sellLyd: 22 * 7,
    profitGbp: 22 - 15,
    profitLyd: 22 * 7 - 15 * 7,
    status: "pending"
  },
  {
    id: 3,
    product: "ساعة يد",
    customer: "إبراهيم فتحي",
    phone: "0933333333",
    address: "مصراتة - وسط المدينة",
    batchId: "B-1002",
    delegate: "سالم",
    gbpBuy: 10,
    gbpSell: 18,
    costLyd: 10 * 7,
    sellLyd: 18 * 7,
    profitGbp: 18 - 10,
    profitLyd: 18 * 7 - 10 * 7,
    status: "pending"
  }
];

let currentOrderFilter = "all";

// ========= ORDERS =========
function filterOrders(status) {
  currentOrderFilter = status;
  document.querySelectorAll(".filter-chips .chip").forEach(chip => chip.classList.remove("active"));
  const map = { all: 0, pending: 1, delivered: 2, cancelled: 3 };
  const chips = document.querySelectorAll(".filter-chips .chip");
  chips[map[status]].classList.add("active");
  renderOrdersTable();
}

function renderOrdersTable() {
  const body = document.getElementById("orders-table");
  body.innerHTML = "";
  const searchTerm = (document.getElementById("orders-search").value || "").toLowerCase();

  let filtered = orders;
  if (currentOrderFilter !== "all") filtered = filtered.filter(o => o.status === currentOrderFilter);

  if (searchTerm) {
    filtered = filtered.filter(
      o =>
        (o.product || "").toLowerCase().includes(searchTerm) ||
        (o.customer || "").toLowerCase().includes(searchTerm)
    );
  }

  filtered.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.product}</td>
      <td>${o.customer}</td>
      <td>${o.phone}</td>
      <td>${o.batchId || "-"}</td>
      <td>${formatMoney(o.costLyd)}</td>
      <td>${formatMoney(o.sellLyd)}</td>
      <td>${formatMoney(o.profitLyd)}</td>
      <td>${renderStatusPill(o.status)}</td>
      <td class="table-actions">
        <button class="icon-btn" onclick="showOrderDetails(${o.id})">تفاصيل</button>
        <button class="icon-btn" onclick="toggleOrderStatus(${o.id})">تغيير الحالة</button>
        <button class="icon-btn danger" onclick="deleteOrder(${o.id})">حذف</button>
      </td>
    `;
    body.appendChild(tr);
  });
}

function showOrderDetails(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return;
  alert(
    "تفاصيل الطلب:\n" +
      "المنتج: " + order.product + "\n" +
      "المستلم: " + order.customer + "\n" +
      "الشحنة: " + (order.batchId || "بدون") + "\n" +
      "سعر الشراء (GBP): " + order.gbpBuy + "\n" +
      "سعر البيع (GBP): " + order.gbpSell + "\n" +
      "الربح (GBP): " + Number(order.profitGbp || 0).toFixed(2) + "\n" +
      "تكلفة الشراء (LYD): " + formatMoney(order.costLyd) + "\n" +
      "سعر البيع (LYD): " + formatMoney(order.sellLyd) + "\n" +
      "الربح (LYD): " + formatMoney(order.profitLyd) + "\n" +
      "الحالة: " + order.status
  );
}

function toggleOrderStatus(id) {
  const order = orders.find(o => o.id === id);
  if (!order) return;
  if (order.status === "pending") order.status = "delivered";
  else if (order.status === "delivered") order.status = "cancelled";
  else order.status = "pending";

  renderOrdersTable();
  renderDashboardStats();
  renderAnalytics();
  renderBatchesTable();
}

function deleteOrder(id) {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return;
  if (!confirm("تأكيد حذف الطلب؟")) return;
  orders.splice(idx, 1);

  renderOrdersTable();
  renderDashboardStats();
  renderAnalytics();
  renderBatchesTable();
}

function scrollToAddOrder() {
  document.getElementById("add-order-card").scrollIntoView({ behavior: "smooth", block: "start" });
}
// ========= AUTO CALCULATION =========
let gbpBuyInput = null;
let gbpSellInput = null;

let costLyd1Input = null;
let sellLyd1Input = null;
let profitGbp1Input = null;
let profitLyd1Input = null;

let costLyd2Input = null;
let sellLyd2Input = null;
let profitGbp2Input = null;
let profitLyd2Input = null;

function bindOrderFormElements() {
  gbpBuyInput = document.getElementById("gbp-buy-input");
  gbpSellInput = document.getElementById("gbp-sell-input");

  costLyd1Input = document.getElementById("cost-lyd-1");
  sellLyd1Input = document.getElementById("sell-lyd-1");
  profitGbp1Input = document.getElementById("profit-gbp-1");
  profitLyd1Input = document.getElementById("profit-lyd-1");

  costLyd2Input = document.getElementById("cost-lyd-2");
  sellLyd2Input = document.getElementById("sell-lyd-2");
  profitGbp2Input = document.getElementById("profit-gbp-2");
  profitLyd2Input = document.getElementById("profit-lyd-2");

  // اربط الأحداث فقط إذا العناصر موجودة
  if (gbpBuyInput) gbpBuyInput.addEventListener("input", recalcOrderTotals);
  if (gbpSellInput) gbpSellInput.addEventListener("input", recalcOrderTotals);
}

function recalcOrderTotals() {
  // حماية من null
  if (!gbpBuyInput || !gbpSellInput) return;

  const gbpBuy = parseFloat(gbpBuyInput.value) || 0;
  const gbpSell = parseFloat(gbpSellInput.value) || 0;

  const cost = gbpBuy * exchangeRate;
  const sell = gbpSell * exchangeRate;
  const pGbp = gbpSell - gbpBuy;
  const pLyd = sell - cost;

  if (costLyd1Input) costLyd1Input.value = cost ? cost.toFixed(2) + " د.ل" : "";
  if (sellLyd1Input) sellLyd1Input.value = sell ? sell.toFixed(2) + " د.ل" : "";
  if (profitGbp1Input) profitGbp1Input.value = pGbp ? pGbp.toFixed(2) : "";
  if (profitLyd1Input) profitLyd1Input.value = pLyd ? pLyd.toFixed(2) + " د.ل" : "";

  if (costLyd2Input) costLyd2Input.value = cost ? cost.toFixed(2) + " د.ل" : "";
  if (sellLyd2Input) sellLyd2Input.value = sell ? sell.toFixed(2) + " د.ل" : "";
  if (profitGbp2Input) profitGbp2Input.value = pGbp ? pGbp.toFixed(2) : "";
  if (profitLyd2Input) profitLyd2Input.value = pLyd ? pLyd.toFixed(2) + " د.ل" : "";
}

function resetOrderForm() {
  document.getElementById("product-name-input").value = "";
  if (gbpBuyInput) gbpBuyInput.value = "";
  if (gbpSellInput) gbpSellInput.value = "";
  document.getElementById("customer-name-input").value = "";
  document.getElementById("phone-input").value = "";
  document.getElementById("address-input").value = "";
  document.getElementById("delegate-input").value = "";
  document.getElementById("batch-select").value = "";
  recalcOrderTotals();
}

function saveOrder() {
  const product = document.getElementById("product-name-input").value.trim();
  const customer = document.getElementById("customer-name-input").value.trim();
  const phoneValue = document.getElementById("phone-input").value.trim();

  if (!product || (!customer && !phoneValue)) {
    alert("أدخل اسم المنتج، واسم الزبون أو رقم الهاتف على الأقل.");
    return;
  }

  if (ENABLE_BLOCKED_CHECK && isCustomerBlocked(customer, phoneValue)) {
    alert("هذا الزبون محظور 🚫 لا يمكن إنشاء طلب جديد له.");
    openPage("blocked");
    return;
  }

  const gbpBuy = parseFloat(gbpBuyInput ? gbpBuyInput.value : 0) || 0;
  const gbpSell = parseFloat(gbpSellInput ? gbpSellInput.value : 0) || 0;

  const cost = gbpBuy * exchangeRate;
  const sell = gbpSell * exchangeRate;
  const pGbp = gbpSell - gbpBuy;
  const pLyd = sell - cost;

  const newOrder = {
    id: orders.length ? orders[orders.length - 1].id + 1 : 1,
    product,
    customer: customer || "-",
    phone: phoneValue || "-",
    address: document.getElementById("address-input").value.trim(),
    batchId: document.getElementById("batch-select").value,
    delegate: document.getElementById("delegate-input").value.trim(),
    gbpBuy,
    gbpSell,
    costLyd: cost,
    sellLyd: sell,
    profitGbp: pGbp,
    profitLyd: pLyd,
    status: "pending"
  };

  orders.push(newOrder);
  renderOrdersTable();
  renderDashboardStats();
  renderAnalytics();
  renderBatchesTable();
  resetOrderForm();
  alert("تم حفظ الطلب بنجاح ✅");
}
