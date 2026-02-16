// Load navbar dynamically
fetch("navbar.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("navbar-placeholder").innerHTML = data;
     updateUserUI();
      updateCartCount();

  })
  .catch((err) => console.error("Error loading navbar:", err));
async function updateUserUI() {
  const auth = isAuthenticated();
  if (auth.status !== "success") return;

  const userRes = await getCurrentUser();

  if (userRes.status === "success") {
    const user = userRes.data;
    const firstName = user.name.split(" ")[0];
    
    
    const authContainer = document.getElementById("auth-link");

    if (authContainer) {
      
      authContainer.outerHTML = `
        <div class="dropdown d-inline-block">
          <button class="user-profile-btn dropdown-toggle" type="button" id="userMenu" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="user-avatar">${firstName.charAt(0).toUpperCase()}</span>
            <span class="d-none d-md-inline ms-1">${firstName}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="userMenu">
           
              <a class="dropdown-item text-danger" href="javascript:void(0)" onclick="logout()">
                <i class="bi bi-box-arrow-right me-2"></i> Logout
              </a>
            </li>
          </ul>
        </div>
      `;
    }
  }
}
// ───────────────────────────────────────────────
//  Imports
// ───────────────────────────────────────────────
import { isAuthenticated, getCurrentUser } from "../data/auth.js";

import { getAllProducts } from "../data/products.js";

import {
  getCurrentUserCartPopulated,
  getCurrentUserCart,
  addToCart,
} from "../data/cart.js";

// ───────────────────────────────────────────────
//  Variables
// ───────────────────────────────────────────────
const productsContainer = document.getElementById("products");
const cartCountEl = document.getElementById("cart-count");
const categoryCards = document.querySelectorAll(".category-card");
const authLink = document.getElementById("auth-link");

let currentUser = null;

// ───────────────────────────────────────────────
//  Check authentication & update UI (name in navbar)
// ───────────────────────────────────────────────
async function checkAuthAndUpdateUI() {
  const authResult = isAuthenticated();
  if (authResult.status === "success") {
    const userRes = await getCurrentUser();
    if (userRes.status === "success") {
      currentUser = userRes.data;
      if (authLink) {
        authLink.innerHTML = `
            Welcome, ${currentUser.name || "User"} 
            <a href="#" id="logout-link" class="ms-3 text-danger">Logout</a>
          `;
        document
          .getElementById("logout-link")
          ?.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.reload();
          });
      }
    }
  }
}

// ───────────────────────────────────────────────
//  Update cart count badge
// ───────────────────────────────────────────────
async function updateCartCount() {
  const cartCountEl = document.getElementById("cart-count");
  if (!cartCountEl) return;

  const cartRes = await getCurrentUserCartPopulated();

  if (cartRes.status === "success" && cartRes.data?.items) {
    const total = cartRes.data.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    cartCountEl.textContent = total;
  } else {
    cartCountEl.textContent = "0";
  }
}

// ───────────────────────────────────────────────
//  Load and display products for a category
// ───────────────────────────────────────────────
async function showProducts(options) {
  productsContainer.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
      </div>`;

  const result = await getAllProducts(options);

  if (result.status !== "success") {
    productsContainer.innerHTML = `
        <p class="col-12 text-center py-5 text-danger">${result.message || "Failed to load products"}</p>`;
    return;
  }

  const products = result.data || [];

  if (products.length === 0) {
    productsContainer.innerHTML = `
        <p class="col-12 text-center py-5 text-muted">No products in this category</p>`;
    return;
  }

  productsContainer.innerHTML = "";

  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "col-lg-3 col-md-4 col-sm-6";

    div.innerHTML = `
        <div class="card product-card h-100 shadow-sm">
          <a href="details.html?id=${product.id}" class="text-decoration-none">
            <img 
              src="${product.image || "https://via.placeholder.com/300"}" 
              class="card-img-top" 
              alt="${product.name}"
              style="height:220px; object-fit:cover;"
            >
          </a>
          <div class="card-body text-center d-flex flex-column">
            <h5 class="card-title mb-3">
              <a href="details.html?id=${product.id}" class="text-dark text-decoration-none">
                ${product.name}
              </a>
            </h5>
            <p class="price mb-3 fw-bold">${product.price} EGP</p>
            <button 
              class="btn btn-primary mt-auto add-to-cart"
              data-id="${product.id}"
            >
              <i class="fas fa-cart-plus me-2"></i>Add to Cart
            </button>
          </div>
        </div>
      `;

    productsContainer.appendChild(div);
  });
}

// ───────────────────────────────────────────────
//  Event Listeners
// ───────────────────────────────────────────────
productsContainer.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("add-to-cart")) return;

  const auth = isAuthenticated();
  if (auth.status !== "success") {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  const btn = e.target;
  const productId = btn.dataset.id;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

  try {
    const res = await addToCart(productId, 1);

    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-cart-plus me-2"></i>Add to Cart';

    if (res.status === "success") {
      alert("Added to cart!");
      await updateCartCount(); // Update badge immediately
    } else {
      alert(res.message || "Failed to add");
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred while adding to cart");
    btn.innerHTML = '<i class="fas fa-cart-plus me-2"></i>Add to Cart';
    btn.disabled = false;
  }
});

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    categoryCards.forEach((c) => c.classList.remove("active"));
    card.classList.add("active");
    if (card.dataset.category === "All") {
      showProducts();
      return;
    }
    showProducts({ category: card.dataset.category });
  });
});

const searchForm = document.getElementById("searchForm");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchInput = document.getElementById("searchInput").value;

  showProducts({ search: searchInput });
});

// ───────────────────────────────────────────────
//  Page Initialization
// ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await checkAuthAndUpdateUI();
  await updateCartCount();
  const url = window.location.href;
  const searchTerm = url.split("?")[1]?.split("=")[1];
  if (searchTerm) {
    await showProducts({ search: searchTerm }); 
    return;
  }
  
  await showProducts(); 
});
