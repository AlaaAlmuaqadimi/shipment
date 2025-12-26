"use strict";

/*
  =============================
  Orders Module (SPA Front Only)
  =============================
  يعتمد على:
    window.AppData = { exchangeRate, orders, batches }
  ويشتغل عند:
    event: page:loaded  (route === "orders")
*/

window.AppData = window.AppData || {
  exchangeRate: 7.0,
  orders: [],
  batches: []
};

let currentOrderFilter = "all";
let ordersMounted = false;

/* ========= Helpers (use global if exists) ========= */
function formatMoney(v) {
  if (typeof window.formatMoney === "function" && window.formatMoney !== formatMoney) {
    return window.formatMoney(v);
  }
  return (Number(v || 0)).toFixed(2) + " د.ل";
}

function renderStatusPill(status) {
  if (typeof window.renderStatusPill === "function" && window.renderStatusPill !== renderStatusPill) {
    return window.renderStatusPill(status);
  }
  if (status === "pending") return '<span class="status-pill status-pending">معلقة</span>';
  if (status === "delivered") return '<span class="status-pill status-done">مستلمة</span>';
  if (status === "cancelled") return '<span class="status-pill status-cancelled">ملغاة</span>';
  return status || "-";
}

/* ========= Filters ========= */
function filterOrders(status) {
  currentOrderFilter = status;

  const chipsWrap = document.querySelector(".filter-chips");
  if (chipsWrap) {
    chipsWrap.querySelectorAll(".chip").forEach(chip => chip.classList.remove("active"));

    // ✅ لو chips فيها data-filter
    const byData = chipsWrap.querySelector(`.chip[data-filter="${status}"]`);
    if (byData) byData.classList.add("active");
    else {
      // ✅ fallback للترتيب القديم
      const map = { all: 0, pending: 1, delivered: 2, cancelled: 3 };
      const chips = chipsWrap.querySelectorAll(".chip");
      if (chips[map[status]]) chips[map[status]].classList.add("active");
    }
  }

  renderOrdersTable();
}

/* ========= Render Orders Table ========= */
function renderOrdersTable() {
  const body = document.getElementById("orders-table");
  if (!body) return;

  body.innerHTML = "";

  const searchTerm = (document.getElementById("orders-search")?.value || "")
    .toLowerCase()
    .trim();

  let list = window.AppData.orders || [];

  if (currentOrderFilter !== "all") {
    list = list.filter(o => o.status === currentOrderFilter);
  }

  if (searchTerm) {
    list = list.filter(
      o =>
        (o.product || "").toLowerCase().includes(searchTerm) ||
        (o.customer || "").toLowerCase().includes(searchTerm)
    );
  }

  if (!list.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="9" class="muted">لا توجد طلبات.</td>`;
    body.appendChild(tr);
    return;
  }

  list.forEach(o => {
    const tr = document.createElement("tr");

    // ✅ data-label لكل td (مهم لعرض Cards على الموبايل)
    tr.innerHTML = `
      <td data-label="المنتج">${o.product || "-"}</td>
      <td data-label="المستلم">${o.customer || "-"}</td>
      <td data-label="الهاتف">${o.phone || "-"}</td>
      <td data-label="الشحنة">${o.batchId || "-"}</td>
      <td data-label="سعر الشراء (د.ل)">${formatMoney(o.costLyd || 0)}</td>
      <td data-label="سعر البيع (د.ل)">${formatMoney(o.sellLyd || 0)}</td>
      <td data-label="الربح (د.ل)">${formatMoney(o.profitLyd || 0)}</td>
      <td data-label="الحالة">${renderStatusPill(o.status)}</td>
      <td data-label="تحكم" class="table-actions">
        <button class="icon-btn" onclick="showOrderDetails(${o.id})">تفاصيل</button>
        <button class="icon-btn" onclick="toggleOrderStatus(${o.id})">تغيير الحالة</button>
        <button class="icon-btn danger" onclick="deleteOrder(${o.id})">حذف</button>
      </td>
    `;

    body.appendChild(tr);
  });
}

/* ========= Order Actions ========= */
function showOrderDetails(id) {
  const order = (window.AppData.orders || []).find(o => o.id === id);
  if (!order) return;

  alert(
    "تفاصيل الطلب:\n" +
      "المنتج: " + (order.product || "-") + "\n" +
      "المستلم: " + (order.customer || "-") + "\n" +
      "الهاتف: " + (order.phone || "-") + "\n" +
      "الشحنة: " + (order.batchId || "-") + "\n" +
      "تكلفة الشراء: " + formatMoney(order.costLyd || 0) + "\n" +
      "سعر البيع: " + formatMoney(order.sellLyd || 0) + "\n" +
      "الربح: " + formatMoney(order.profitLyd || 0) + "\n" +
      "الحالة: " + (order.status || "-")
  );
}

function toggleOrderStatus(id) {
  const order = (window.AppData.orders || []).find(o => o.id === id);
  if (!order) return;

  if (order.status === "pending") order.status = "delivered";
  else if (order.status === "delivered") order.status = "cancelled";
  else order.status = "pending";

  renderOrdersTable();

  // ✅ إشعار لباقي الصفحات (Dashboard/Analytics/Batches)
  window.dispatchEvent(new CustomEvent("data:changed", { detail: { source: "orders" } }));
}

function deleteOrder(id) {
  const list = window.AppData.orders || [];
  const idx = list.findIndex(o => o.id === id);
  if (idx === -1) return;

  if (!confirm("تأكيد حذف الطلب؟")) return;

  list.splice(idx, 1);
  renderOrdersTable();

  window.dispatchEvent(new CustomEvent("data:changed", { detail: { source: "orders" } }));
}

/* ========= Scroll ========= */
function scrollToAddOrder() {
  const el = document.getElementById("add-order-card");
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ========= Mount (bind events after page injected) ========= */
function mountOrdersPage() {
  if (ordersMounted) return;
  ordersMounted = true;

  // ✅ ربط البحث
  const search = document.getElementById("orders-search");
  if (search) {
    search.addEventListener("input", renderOrdersTable);
  }

  // ✅ ربط chips (يدعم data-filter، ويدعم أيضاً وجود onclick في HTML)
  document.querySelectorAll(".filter-chips .chip").forEach((chip) => {
    // لو عنده onclick في HTML ما نكسرش — بس نضيف دعم data-filter
    chip.addEventListener("click", () => {
      const v = chip.getAttribute("data-filter");
      if (v) filterOrders(v);
      else {
        // fallback: لو ما فيش data-filter، نخلي filterOrders تتعامل مع active فقط
        // (الـ HTML القديم يستدعي filterOrders بنفسه عبر onclick)
      }
    });
  });
}

/* ========= Route Hook ========= */
window.addEventListener("page:loaded", (e) => {
  if (!e || !e.detail || e.detail.route !== "orders") return;

  // ✅ مهم: بما أن الصفحة تُحقن الآن، نربط الأحداث بعدها
  ordersMounted = false;       // يسمح بالربط لكل دخول للصفحة (لأن DOM يتغير)
  mountOrdersPage();
  renderOrdersTable();
});

/* ========= Expose ========= */
window.filterOrders = filterOrders;
window.renderOrdersTable = renderOrdersTable;
window.showOrderDetails = showOrderDetails;
window.toggleOrderStatus = toggleOrderStatus;
window.deleteOrder = deleteOrder;
window.scrollToAddOrder = scrollToAddOrder;
