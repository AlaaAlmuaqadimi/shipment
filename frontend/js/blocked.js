// =============================
// QS System - blocked.js
// =============================

// ========= BLOCKED CUSTOMERS (IN-MEMORY ONLY) =========
const blockedCustomers = [];

// ========= BLOCKED CUSTOMERS =========
function resetBlockedForm() {
  document.getElementById("blocked-name").value = "";
  document.getElementById("blocked-phone").value = "";
  document.getElementById("blocked-reason").value = "";
}

function addBlockedCustomer() {
  const name = document.getElementById("blocked-name").value.trim();
  const phone = normalizePhone(document.getElementById("blocked-phone").value);
  const reason = document.getElementById("blocked-reason").value.trim();

  if (!name && !phone) {
    alert("لازم تدخل على الأقل الاسم أو رقم الهاتف ✅");
    return;
  }

  const id = blockedCustomers.length ? blockedCustomers[blockedCustomers.length - 1].id + 1 : 1;
  blockedCustomers.push({
    id,
    name: name || "(بدون اسم)",
    phone: phone || "-",
    reason: reason || "-",
    isBlocked: true,
    createdAt: new Date()
  });

  resetBlockedForm();
  renderBlockedTable();
  alert("تم إضافة الزبون إلى قائمة المحظورين 🚫");
}

function toggleBlockedStatus(id) {
  const item = blockedCustomers.find(b => b.id === id);
  if (!item) return;
  item.isBlocked = !item.isBlocked;
  renderBlockedTable();
}

function deleteBlockedCustomer(id) {
  const idx = blockedCustomers.findIndex(b => b.id === id);
  if (idx === -1) return;
  if (!confirm("تأكيد حذف السجل من القائمة؟")) return;
  blockedCustomers.splice(idx, 1);
  renderBlockedTable();
}

function renderBlockedTable() {
  const body = document.getElementById("blocked-table");
  const countEl = document.getElementById("blocked-count");
  const searchTerm = (document.getElementById("blocked-search")?.value || "").toLowerCase().trim();

  body.innerHTML = "";
  let filtered = blockedCustomers;

  if (searchTerm) {
    filtered = filtered.filter(b => {
      const n = (b.name || "").toLowerCase();
      const p = normalizePhone(b.phone).toLowerCase();
      return n.includes(searchTerm) || p.includes(searchTerm);
    });
  }

  countEl.textContent = blockedCustomers.filter(b => b.isBlocked).length;

  if (!filtered.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="5" class="muted">لا توجد بيانات مطابقة.</td>`;
    body.appendChild(tr);
    return;
  }

  filtered.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.name}</td>
      <td>${b.phone}</td>
      <td>${b.reason}</td>
      <td>${b.isBlocked ? '<span class="status-pill status-blocked">محظور</span>' : '<span class="status-pill status-done">مسموح</span>'}</td>
      <td class="table-actions">
        <button class="icon-btn" onclick="toggleBlockedStatus(${b.id})">${b.isBlocked ? "إزالة الحظر" : "إعادة الحظر"}</button>
        <button class="icon-btn danger" onclick="deleteBlockedCustomer(${b.id})">حذف</button>
      </td>
    `;
    body.appendChild(tr);
  });
}
