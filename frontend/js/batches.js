// =============================
// QS System - batches.js
// =============================

// ✅ batches now include batchExtraCostsLyd
let batches = [
  {
    id: "B-1001",
    shippingCompanyCode: "ARX-TRP",
    shipDate: "2025-12-20",
    notes: "شحنة تجريبية",
    status: "open",
    batchExtraCostsLyd: 0
  },
  {
    id: "B-1002",
    shippingCompanyCode: "UPS-001",
    shipDate: "2025-12-22",
    notes: "-",
    status: "open",
    batchExtraCostsLyd: 0
  }
];

// ========= LOCAL STORAGE (Batches) =========
function loadBatchesFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEYS.batches);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;

    // ✅ ضمان وجود الحقل الجديد حتى لو بيانات قديمة
    batches = parsed.map(b => ({
      ...b,
      batchExtraCostsLyd: Number(b.batchExtraCostsLyd || 0)
    }));

    return true;
  } catch (e) {
    console.warn("Failed to load batches from localStorage", e);
    return false;
  }
}

function saveBatchesToStorage() {
  try {
    localStorage.setItem(LS_KEYS.batches, JSON.stringify(batches));
  } catch (e) {
    console.warn("Failed to save batches to localStorage", e);
  }
}

// ========= BATCHES (Create/Edit) =========
let batchModalMode = "create"; // create | edit
let editingBatchId = null;

function renderBatchesTable() {
  const body = document.getElementById("batches-table");
  body.innerHTML = "";

  getBatchesWithTotals().forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${safeText(b.shippingCompanyCode)}</td>
      <td>${safeText(b.shipDate)}</td>
      <td>${b.ordersCount}</td>
      <td>${formatMoney(b.totalCost)}</td>
      <td>${formatMoney(b.totalSell)}</td>
      <td>${formatMoney(b.grossProfit)}</td>

      <!-- NEW -->
      <td>${formatMoney(b.extraCosts)}</td>
      <td><strong>${formatMoney(b.netProfit)}</strong></td>

      <td>${renderBatchStatusPill(b.status)}</td>
      <td class="table-actions">
        <button class="icon-btn" onclick="showBatchDetails('${b.id}')">عرض</button>
        <button class="icon-btn" onclick="openBatchModal('${b.id}')">تعديل</button>
      </td>
    `;
    body.appendChild(tr);
  });

  // Fill batch select
  const batchSelect = document.getElementById("batch-select");
  batchSelect.innerHTML = '<option value="">بدون شحنة</option>';
  batches.forEach(b => {
    const opt = document.createElement("option");
    opt.value = b.id;
    opt.textContent = b.id;
    batchSelect.appendChild(opt);
  });
}

function showBatchDetails(batchId) {
  const body = document.getElementById("batch-details-table");
  body.innerHTML = "";

  const batch = batches.find(b => b.id === batchId);
  const totals = getBatchesWithTotals().find(x => x.id === batchId);

  const header = batch
    ? `شحنة: ${batchId} • كود: ${safeText(batch.shippingCompanyCode)} • تاريخ: ${safeText(batch.shipDate)} • مصاريف: ${formatMoney(batch.batchExtraCostsLyd || 0)} • ربح بعد الخصم: ${formatMoney((totals?.netProfit ?? 0))}`
    : `شحنة: ${batchId}`;

  document.getElementById("batch-details-sub").textContent = header;

  const batchOrders = orders.filter(o => o.batchId === batchId);
  if (!batchOrders.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="muted">لا توجد طلبات داخل هذه الشحنة.</td>`;
    body.appendChild(tr);
    return;
  }

  batchOrders.forEach(o => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${o.product}</td>
      <td>${o.customer}</td>
      <td>${formatMoney(o.sellLyd)}</td>
      <td>${formatMoney(o.profitLyd)}</td>
      <td>${renderStatusPill(o.status)}</td>
    `;
    body.appendChild(tr);
  });
}

function openBatchModal(batchId = null) {
  batchModalMode = batchId ? "edit" : "create";
  editingBatchId = batchId || null;

  const overlay = document.getElementById("batch-modal");
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");

  // fields
  const idEl = document.getElementById("batch-id-input");
  const codeEl = document.getElementById("shipping-code-input");
  const dateEl = document.getElementById("ship-date-input");
  const notesEl = document.getElementById("batch-notes-input");
  const statusEl = document.getElementById("batch-status-input");
  const extraEl = document.getElementById("batch-extra-costs-input");

  if (batchModalMode === "edit") {
    const b = batches.find(x => x.id === batchId);
    if (!b) return;

    idEl.value = b.id;
    idEl.disabled = true; // لا نغير الـ ID في edit
    codeEl.value = b.shippingCompanyCode || "";
    dateEl.value = (b.shipDate && b.shipDate !== "-") ? b.shipDate : "";
    notesEl.value = (b.notes && b.notes !== "-") ? b.notes : "";
    statusEl.value = b.status || "open";
    extraEl.value = Number(b.batchExtraCostsLyd || 0);
  } else {
    idEl.value = "";
    idEl.disabled = false;
    codeEl.value = "";
    dateEl.value = new Date().toISOString().slice(0, 10);
    notesEl.value = "";
    statusEl.value = "open";
    extraEl.value = 0;
  }

  setTimeout(() => idEl.focus(), 50);
}

function closeBatchModal() {
  const overlay = document.getElementById("batch-modal");
  overlay.classList.remove("is-open");
  overlay.setAttribute("aria-hidden", "true");
}

function createBatchFromModal() {
  const idEl = document.getElementById("batch-id-input");
  const batchId = (idEl.value || "").trim();
  const shippingCompanyCode = (document.getElementById("shipping-code-input").value || "").trim();
  const shipDate = (document.getElementById("ship-date-input").value || "").trim();
  const notes = (document.getElementById("batch-notes-input").value || "").trim();
  const status = (document.getElementById("batch-status-input").value || "open").trim();

  const extraCostsRaw = document.getElementById("batch-extra-costs-input").value;
  const batchExtraCostsLyd = Number(parseFloat(extraCostsRaw) || 0);

  if (!batchId) {
    alert("رقم الشحنة (batchId) مطلوب ✅");
    return;
  }

  if (batchModalMode === "create") {
    const exists = batches.some(b => String(b.id).toLowerCase() === batchId.toLowerCase());
    if (exists) {
      alert("رقم الشحنة موجود بالفعل ❌");
      return;
    }

    batches.push({
      id: batchId,
      shippingCompanyCode: shippingCompanyCode || "-",
      shipDate: shipDate || "-",
      notes: notes || "-",
      status: status === "closed" ? "closed" : "open",
      batchExtraCostsLyd
    });
  } else {
    // edit
    const b = batches.find(x => x.id === editingBatchId);
    if (!b) return;

    b.shippingCompanyCode = shippingCompanyCode || "-";
    b.shipDate = shipDate || "-";
    b.notes = notes || "-";
    b.status = status === "closed" ? "closed" : "open";
    b.batchExtraCostsLyd = batchExtraCostsLyd;
  }

  saveBatchesToStorage();
  renderBatchesTable();
  renderDashboardStats();
  renderAnalytics();

  closeBatchModal();
  alert(batchModalMode === "create" ? "تم إنشاء الشحنة ✅" : "تم تعديل الشحنة ✅");
}

// close modal: click outside
document.addEventListener("click", (e) => {
  const overlay = document.getElementById("batch-modal");
  if (!overlay) return;
  if (!overlay.classList.contains("is-open")) return;
  if (e.target === overlay) closeBatchModal();
});

// close modal: ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const overlay = document.getElementById("batch-modal");
    if (overlay && overlay.classList.contains("is-open")) closeBatchModal();
  }
});
