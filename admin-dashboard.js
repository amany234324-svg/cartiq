// Admin Protection
// const token = localStorage.getItem("token");
// const role = localStorage.getItem("role");

// if (!token || role !== "admin") {
//     window.location.href = "login.html";
// }

import { hasRole, getCurrentUser, logout } from './data/auth.js';
import { getAllOrders, getOrdersStatistics } from './data/orders.js';
import { getUserById } from './data/users.js';

const isAuthorized = hasRole('admin');

if (isAuthorized.status === 'fail') {
  // console.log(hasRole('admin').message)
  window.location.href = 'login.html';
}

// Logout
// document.getElementById("logoutBtn").addEventListener("click", function () {
//     localStorage.clear();
//     window.location.href = "login.html";
// });

// fetch("https://example.com/api/admin/dashboard", {
//     headers: {
//         "Authorization": `Bearer ${token}`
//     }
// })
// .then(res => res.json())
// .then(data => {

//     document.getElementById("totalProducts").textContent = data.totalProducts;
//     document.getElementById("totalOrders").textContent = data.totalOrders;
//     document.getElementById("totalRevenue").textContent = "$" + data.totalRevenue;

//     const table = document.getElementById("ordersTable");

//     data.recentOrders.forEach(order => {
//         const row = `
//             <tr>
//                 <td>#${order.id}</td>
//                 <td>${order.customer}</td>
//                 <td>$${order.amount}</td>
//                 <td>${order.status}</td>
//             </tr>
//         `;
//         table.innerHTML += row;
//     });

// })
// .catch(() => {
//     alert("Error loading dashboard data");
// });

window.addEventListener('load', async () => {
  const userRes = await getCurrentUser();
  if (userRes.status === 'success') {
    const adminData = userRes.data;
    const adminName = adminData.name;

    document.getElementById('adminName').textContent = adminName;

    document.getElementById('adminAvatar').textContent = adminName
      .charAt(0)
      .toUpperCase();
  }

  // ---   Logout ---
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
    e.preventDefault();
    const res = logout();
    if (res.status === 'success') {
      window.location.href = 'login.html';
    }
  });
  const res = await getOrdersStatistics();

  console.log(res);
  if (res.status !== 'success') {
    // do something
  }

  document.getElementById('totalProducts').textContent = res.data.totalProducts;
  document.getElementById('totalOrders').textContent = res.data.totalOrders;
  document.getElementById('totalRevenue').textContent =
    '$' + res.data.totalRevenue;
  document.getElementById('pendingOrders').textContent = res.data.pendingOrders;
  document.getElementById('customers').textContent = res.data.customers;

  const table = document.getElementById('ordersTable');

  const res2 = await getAllOrders();

  if (res2.status === 'success') {
    const orders = res2.data.slice(0, 6);
    for (const order of orders) {
      const user = await getUserById(order.userId);
      let username = user?.data?.name;
      if (user.status === 'fail') {
        username = 'Deleted User';
      }
      const row = `
                <tr>
                    <td>#${order.id}</td>
                    <td>${username}</td>
                    <td>$${order.totalPrice}</td>
                    <td>${order.status}</td>
                </tr>
            `;
      table.innerHTML += row;
    }

    //     res2.data.forEach((order) => {

    //       const row = `
    //                 <tr>
    //                     <td>#${order.id}</td>
    //                     <td>${order.userId}</td>
    //                     <td>$${order.totalPrice}</td>
    //                     <td>${order.status}</td>
    //                 </tr>
    //             `;
    //       table.innerHTML += row;
    //     });
  }
});
