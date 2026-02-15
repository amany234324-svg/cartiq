// Admin Protection
// const role = localStorage.getItem("role");
// if (role !== "admin") {
//     window.location.href = "login.html";
// }

import { hasRole , getCurrentUser, logout } from "./data/auth.js";
import {
  getAllProducts,
  getProductById,
  updateProductById,
} from "./data/products.js";
import { validateProductData } from "./utils/validation.js";

if (hasRole("admin").status === "fail") {
  // console.log(hasRole('admin').message)
  window.location.href = "login.html";
}

// let products = JSON.parse(localStorage.getItem("products")) || [];
let modal;

window.addEventListener("load", async () => {
  //   const products = await getAllProducts();
  const userRes = await getCurrentUser();
  if (userRes.status === "success") {
    const adminData = userRes.data;
    const adminName = adminData.name;
    
  
    document.getElementById("adminName").textContent = adminName;
    

    document.getElementById("adminAvatar").textContent = adminName.charAt(0).toUpperCase();
  }

  // ---   Logout ---
  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    const res = logout(); 
    if (res.status === "success") {
      window.location.href = "login.html";
    }
  });
  await renderProducts();
});

async function renderProducts(options) {
  const tableBody = document.getElementById("productTableBody");
  tableBody.innerHTML = "";

  const res = await getAllProducts(options);

  if (res.status !== "success") {
    // do something
    return;
  }

  let products = res.data;

  products.forEach((product, index) => {
    let stockClass = product.stock <= 5 ? "low-stock" : "";

    tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><img src="${product.image}" width="50"></td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td class="${stockClass}">${product.stock}</td>
                <td>${product.category}</td>
                <td>
                    <button data-id="${product.id}" class="btn btn-warning btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Delete</button>
                </td>
            </tr>
        `;

    document.querySelectorAll(".edit-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const id = this.dataset.id;
        //   console.log(id);
        editProduct(id);
      });
    });
  });
}

// renderProducts();

// Save Product
document
  .getElementById("saveProductBtn")
  .addEventListener("click", async function () {
    const errorMsg = document.getElementById("errorMsg");

    const productId = document.getElementById("productId").value;
    const productData = {
      name: document.getElementById("productName").value.trim(),
      price: document.getElementById("productPrice").value,
      stock: document.getElementById("productStock").value,
      category: document.getElementById("productCategory").value,
      description: document.getElementById("productDescription").value,
      image: document.getElementById("imagePreview").src,
    };

    // if (!name || !price || !stock) {
    //   alert("Please fill all required fields");
    //   return;
    // }

    const validatedData = validateProductData(productData);
    if (!validatedData.valid) {
      errorMsg.classList.remove("d-none");
      errorMsg.textContent = validatedData.error;
    }

    const res = await updateProductById(productId, productData);

    if (res.status === "success") {
      modal.hide();
      await renderProducts();
    }
  });

// Edit
async function editProduct(productId) {
  const res = await getProductById(productId);
  //   const product = products.find(product => product.id === productId);
  const product = res.data;
  document.getElementById("productName").value = product.name;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productDescription").value = product.description;
  document.getElementById("imagePreview").src = product.image;
  document.getElementById("imagePreview").classList.remove("d-none");
  document.getElementById("productId").value = product.id;

  modal = new bootstrap.Modal(document.getElementById("productModal"));
  modal.show();
}

// Delete
function deleteProduct(index) {
  if (confirm("Are you sure?")) {
    products.splice(index, 1);
    localStorage.setItem("products", JSON.stringify(products));
    location.reload();
  }
}

// Image Preview
document
  .getElementById("productImage")
  .addEventListener("change", function (e) {
    const reader = new FileReader();

    reader.onload = function () {
      const preview = document.getElementById("imagePreview");
      preview.src = reader.result;
      preview.classList.remove("d-none");
    };

    reader.readAsDataURL(e.target.files[0]);
  });

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Search
document.getElementById("searchInput").addEventListener(
  "input",
  debounce(function () {
    const value = this.value.toLowerCase();
    renderProducts({ search: value });
  }, 300),
);

// document.getElementById("searchInput").addEventListener("input", function () {
//   const value = this.value.toLowerCase();

//   //   const filtered = products.filter((p) => p.name.toLowerCase().includes(value));

//   renderProducts(filtered);
// });

// Logout
function logout() {
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
