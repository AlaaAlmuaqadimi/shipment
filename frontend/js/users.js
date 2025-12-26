// =============================
// QS System - users.js
// =============================

const users = [
  { id: 1, name: "Admin User", username: "admin", role: "Admin", permissions: "Full Access" },
  { id: 2, name: "Order Operator", username: "operator1", role: "Operator", permissions: "Add / Update Orders" }
];

// ========= USERS =========
function renderUsersTable() {
  const body = document.getElementById("users-table");
  body.innerHTML = "";
  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.name}</td>
      <td>${u.username}</td>
      <td>${u.role}</td>
      <td>${u.permissions}</td>
      <td class="table-actions">
        <button class="icon-btn">تعديل</button>
        <button class="icon-btn danger" onclick="deleteUser(${u.id})">حذف</button>
      </td>
    `;
    body.appendChild(tr);
  });
}

function createDummyUser() {
  const id = users.length ? users[users.length - 1].id + 1 : 1;
  users.push({
    id,
    name: "User " + id,
    username: "user" + id,
    role: "Operator",
    permissions: "Add Orders"
  });
  renderUsersTable();
  alert("تمت إضافة مستخدم تجريبي جديد ✅");
}

function deleteUser(id) {
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return;
  if (!confirm("تأكيد حذف المستخدم؟")) return;
  users.splice(idx, 1);
  renderUsersTable();
}
