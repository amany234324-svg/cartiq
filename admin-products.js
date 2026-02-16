// Admin Protection
// const role = localStorage.getItem("role");
// if (role !== "admin") {
//     window.location.href = "login.html";
// }

import { hasRole, getCurrentUser, logout } from './data/auth.js';
import {
  getAllProducts,
  getProductById,
  updateProductById,
  createProduct,
  deleteProductById,
} from './data/products.js';
import { validateProductData } from './utils/validation.js';

if (hasRole('admin').status === 'fail') {
  // console.log(hasRole('admin').message)
  window.location.href = 'login.html';
}

// let products = JSON.parse(localStorage.getItem("products")) || [];
const productModal = new bootstrap.Modal(
  document.getElementById('productModal'),
);

let searchInput = document.getElementById('searchInput');

window.addEventListener('load', async () => {
  //   const products = await getAllProducts();
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
  await renderProducts();
});

async function renderProducts(options) {
  const tableBody = document.getElementById('productTableBody');
  tableBody.innerHTML = '';

  if (searchInput.value) {
    options = { search: searchInput.value };
  }
  const res = await getAllProducts(options);

  if (res.status !== 'success') {
    // do something
    return;
  }

  let products = res.data;

  products.forEach((product, index) => {
    let stockClass = product.stock <= 5 ? 'low-stock' : '';

    tableBody.innerHTML += `
            <tr>
                <td>${index + 1}</td>
                <td><img src="${product.image}" width="50"></td>
                <td>${product.name}</td>
                <td>$${product.price}</td>
                <td class="${stockClass}">${product.stock}</td>
                <td>${product.category}</td>
                <td>
                    <button type="button" data-id="${product.id}" class="btn btn-warning btn-sm edit-btn">Edit</button>
                    <button type="button" data-id="${product.id}" class="btn btn-danger btn-sm delete-btn">Delete</button>
                </td>
            </tr>
        `;
  });

  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const id = this.dataset.id;
      //   console.log(id);
      editProduct(id);
    });
  });

  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const id = this.dataset.id;
      //   console.log(id);
      deleteProduct(id);
    });
  });
}

// renderProducts();

// Save Product
document
  .getElementById('saveProductBtn')
  .addEventListener('click', async function (e) {
    e.preventDefault();
    const errorMsg = document.getElementById('errorMsg');

    const productId = document.getElementById('productId').value;

    const productData = {
      name: document.getElementById('productName').value.trim(),
      price: document.getElementById('productPrice').value,
      stock: document.getElementById('productStock').value,
      category: document.getElementById('productCategory').value,
      description: document.getElementById('productDescription').value,
    };

    const image = document.getElementById('productImage').files[0];
    if (image) {
      const form = new FormData();
      form.append('productImage', image);
      productData.image = form;
    }
    // console.log(productData.image);

    // if (!name || !price || !stock) {
    //   alert("Please fill all required fields");
    //   return;
    // }

    const validatedData = validateProductData(productData);
    if (!validatedData.valid) {
      errorMsg.classList.remove('d-none');
      errorMsg.textContent = validatedData.error;
      return;
    }

    let res;
    if (productId) {
      res = await updateProductById(productId, productData);
    } else {
      res = await createProduct(productData);
    }

    if (res.status === 'success') {
      productModal.hide();
      await renderProducts();
    }
  });

// Edit
async function editProduct(productId) {
  const res = await getProductById(productId);
  //   const product = products.find(product => product.id === productId);
  const product = res.data;
  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('productName').value = product.name;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productStock').value = product.stock;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('imagePreview').src = product.image;
  document.getElementById('imagePreview').classList.remove('d-none');
  document.getElementById('productId').value = product.id;

  productModal.show();
}

document.getElementById('addProductBtn').addEventListener('click', () => {
  addProduct();
});

async function addProduct() {
  //   const product = products.find(product => product.id === productId);

  document.getElementById('productId').value = null;
  document.getElementById('modalTitle').textContent = 'Add Product';
  document.getElementById('productName').value = '';
  document.getElementById('productPrice').value = '';
  document.getElementById('productStock').value = '';
  document.getElementById('productCategory').value = '';
  document.getElementById('productDescription').value = '';
  document.getElementById('imagePreview').src = '';
  document.getElementById('imagePreview').classList.add('d-none');

  productModal.show();
}

// Delete
async function deleteProduct(id) {
  if (confirm('Are you sure?')) {
    // products.splice(index, 1);
    // localStorage.setItem('products', JSON.stringify(products));
    // location.reload();

    const res = await deleteProductById(id);

    if (res.status === 'success') {
      renderProducts();
    }
  }
}

// Image Preview
document
  .getElementById('productImage')
  .addEventListener('change', function (e) {
    const reader = new FileReader();

    reader.onload = function () {
      const preview = document.getElementById('imagePreview');
      preview.src = reader.result;
      preview.classList.remove('d-none');
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
searchInput.addEventListener(
  'input',
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
// function logout() {
//   localStorage.removeItem("role");
//   window.location.href = "login.html";
// }
