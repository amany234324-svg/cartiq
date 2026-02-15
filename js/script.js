// ================= IMPORT API (لازم أول حاجة) =================
import { isAuthenticated, getCurrentUser } from "../data/auth.js";
import { getAllProducts } from "../data/products.js";
import { getCurrentUserCartPopulated, addToCart } from "../data/cart.js";

export async function updateCartCount() {
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

// ================= DOM READY =================
document.addEventListener("DOMContentLoaded", () => {
  const productsContainer = document.getElementById("products-container");
  const cartCountEl = document.getElementById("cart-count");

  if (!productsContainer) {
    console.error("products-container not found");
    return;
  }

  // ================= LOAD NAVBAR =================
fetch("navbar.html")
.then((res) => res.text())
.then((data) => {
  document.getElementById("navbar-placeholder").innerHTML = data;
  updateUserUI();
  updateCartCount();
})
.catch((err) => console.error("Navbar load error:", err));

  // ================= UPDATE USER NAME =================
  async function updateUserUI() {
    const auth = isAuthenticated();
    if (auth.status !== "success") return;

    const userRes = await getCurrentUser();

    if (userRes.status === "success") {
      const userName = userRes.data.name || "User";
      const loginLink = document.getElementById("loginLink");

      if (loginLink) {
        loginLink.innerHTML = `
          Welcome ${userName}
          <button onclick="logout()" class="btn btn-sm btn-danger ms-2">
            Logout
          </button>
        `;
        loginLink.href = "#";
      }
    }
  }

  // ================= LOGOUT =================
  window.logout = function () {
    localStorage.clear();
    window.location.reload();
  };

  // ================= UPDATE CART COUNT =================
  // async function updateCartCount() {
  //   const cartCountEl = document.getElementById("cart-count");
  //   if (!cartCountEl) return;

  //   const cartRes = await getCurrentUserCartPopulated();

  //   if (cartRes.status === "success" && cartRes.data?.items) {
  //     const total = cartRes.data.items.reduce(
  //       (sum, item) => sum + item.quantity,
  //       0
  //     );

  //     cartCountEl.textContent = total;
  //   } else {
  //     cartCountEl.textContent = "0";
  //   }
  // }
  // ================= LOAD PRODUCTS =================
  async function loadProducts(options = {}) {
    productsContainer.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border"></div>
    </div>
  `;

    const result = await getAllProducts(options);

    if (result.status !== "success") {
      productsContainer.innerHTML = `<h3>Error loading products</h3>`;
      return;
    }

    productsContainer.innerHTML = "";

    result.data.forEach((product) => {
      let classes = "grid-item col-6 col-md-4 col-lg-3";

      if (product.isBest) classes += " best";
      if (product.isFeatured) classes += " feat";
      if (product.isNew) classes += " new";

      const html = `
      <div class="${classes}">
        <div class="card h-100">
          <a href="details.html?id=${product.id}" class="text-decoration-none">
            <img src="${product.image}" class="card-img-top"></a>
          <div class="card-body text-center">
            <h5>${product.name}</h5>
            <p>${product.price} EGP</p>
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

      productsContainer.insertAdjacentHTML("beforeend", html);
    });

    // تشغيل الفلتر
    const $grid = $("#products-container").isotope({
      itemSelector: ".grid-item",
      layoutMode: "fitRows",
    });

    $(".filter-button-group").on("click", "button", function () {
      $(".filter-button-group .btn").removeClass("active-filter-btn");
      $(this).addClass("active-filter-btn");

      const filterValue = $(this).attr("data-filter");
      $grid.isotope({ filter: filterValue });
    });
  }

  // ================= ADD TO CART =================
  productsContainer.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("add-to-cart")) return;

    const auth = isAuthenticated();

    if (auth.status !== "success") {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }

    const productId = e.target.dataset.id;

    const res = await addToCart(productId, 1);

    if (res.status === "success") {
      alert("Added to cart");
      updateCartCount();
    } else {
      alert(res.message || "Failed");
    }
  });

  loadProducts();

  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchInput = document.getElementById("searchInput").value;

    // loadProducts({search: searchInput})
    window.location.href = `collection.html?search=${searchInput}`;
  });
});
