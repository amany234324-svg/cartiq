import { hasRole, getCurrentUser, logout } from './data/auth.js';
import { getAllOrders, updateOrderById } from './data/orders.js';
import { getUserById } from './data/users.js';

const authCheck = hasRole('admin');
if (authCheck.status === 'fail') {
  window.location.href = 'login.html';
}

window.addEventListener('load', async () => {
  await displayAdminInfo();
  await loadOrders();
});

async function displayAdminInfo() {
  const userRes = await getCurrentUser();
  if (userRes.status === 'success') {
    const admin = userRes.data;
    document.getElementById('adminName').textContent = admin.name;
    document.getElementById('adminAvatar').textContent = admin.name
      .charAt(0)
      .toUpperCase();
  }
}

async function loadOrders() {
  const tbody = document.querySelector('table tbody');
  tbody.innerHTML =
    '<tr><td colspan="6" class="text-center">Loading orders...</td></tr>';

  const res = await getAllOrders();
  if (res.status === 'success') {
    tbody.innerHTML = '';

    const orders = res.data;
    for (const order of orders) {
      const userRes = await getUserById(order.userId);
      const customerName =
        userRes.status === 'success' ? userRes.data.name : 'Unknown';

      const row = document.createElement('tr');
      row.style.cursor = 'pointer';
      row.innerHTML = `
          <td>${order.id}</td>
          <td>${customerName}</td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>$${order.totalPrice.toFixed(2)}</td>
          <td>${getStatusBadge(order.status.toLowerCase())}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary view-btn" data-id="${order.id}">
              <i class="bi bi-eye"></i> View
            </button>
          </td>
        `;

      row.addEventListener('click', () => openOrderModal(order, customerName));
      tbody.appendChild(row);
    }
  }
}

function getStatusBadge(status) {
  const colors = {
    pending: 'bg-warning text-dark',
    processing: 'bg-info',
    shipped: 'bg-primary',
    paid: 'bg-primary',
    delivered: 'bg-success',
  };
  return `<span class="badge ${colors[status] || 'bg-secondary'}">${status}</span>`;
}

async function openOrderModal(order, customerName) {
  const modal = new bootstrap.Modal(document.getElementById('orderModal'));

  document.getElementById('modalOrderNum').textContent = order.id;
  document.getElementById('modalCustomer').textContent = customerName;
  document.getElementById('modalDate').textContent = new Date(
    order.createdAt,
  ).toLocaleString();
  document.getElementById('modalStatus').value = order.status;
  document.getElementById('modalAddress').textContent =
    `${order.shippingInfo.address}, ${order.shippingInfo.city}`;
  document.getElementById('modalPhone').textContent = order.shippingInfo.phone;
  document.getElementById('modalSubtotal').textContent =
    order.subtotal.toFixed(2);
  document.getElementById('modalTax').textContent = order.tax.toFixed(2);
  document.getElementById('modalTotal').textContent =
    order.totalPrice.toFixed(2);

  // عرض المنتجات داخل المودال
  const itemsDiv = document.getElementById('modalItems');
  itemsDiv.innerHTML = order.items
    .map(
      (item) => `
      <div class="list-group-item d-flex justify-content-between align-items-center">
        <span>${item.name} <small class="text-muted">x${item.quantity}</small></span>
        <span>$${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    `,
    )
    .join('');

  // تفعيل زرار التحديث داخل المودال
  const updateBtn = document.querySelector('#orderModal .btn-primary');
  updateBtn.onclick = async () => {
    const newStatus = document.getElementById('modalStatus').value;
    const updateRes = await updateOrderById(order.id, { status: newStatus });
    if (updateRes.status === 'success') {
      // alert('Order status updated!');
      modal.hide();
      loadOrders();
    }
  };

  modal.show();
}

document
  .getElementById('statusFilter')
  .addEventListener('change', function (e) {
    // const selectedStatus = e.target.value;
    // loadOrders({ status: selectedStatus });
  });

//ز(Logout)
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();

  logout();
  window.location.href = 'login.html';
});
