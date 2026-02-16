// ================= IMPORT API   ) =================
import { isAuthenticated, getCurrentUser, hasRole } from '../data/auth.js';
import { getAllProducts } from '../data/products.js';
import { getCurrentUserCartPopulated, addToCart } from '../data/cart.js';

if (hasRole('customer').status !== 'success') {
  window.location.href = 'login.html';
}

export async function updateCartCount() {
  const cartCountEl = document.getElementById('cart-count');
  if (!cartCountEl) return;

  const cartRes = await getCurrentUserCartPopulated();

  if (cartRes.status === 'success' && cartRes.data?.items) {
    const total = cartRes.data.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    cartCountEl.textContent = total;
  } else {
    cartCountEl.textContent = '0';
  }
}

// ================= DOM READY =================
document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products-container');
  const cartCountEl = document.getElementById('cart-count');

  if (!productsContainer) {
    console.error('products-container not found');
    return;
  }

  // ================= LOAD NAVBAR =================
  fetch('navbar.html')
    .then((res) => res.text())
    .then((data) => {
      document.getElementById('navbar-placeholder').innerHTML = data;
      updateUserUI();
      updateCartCount();
    })
    .catch((err) => console.error('Navbar load error:', err));
  async function updateUserUI() {
    const auth = isAuthenticated();
    if (auth.status !== 'success') return;

    const userRes = await getCurrentUser();

    if (userRes.status === 'success') {
      const user = userRes.data;
      const firstName = user.name.split(' ')[0];

      // نبحث عن عنصر تسجيل الدخول فقط
      const authContainer = document.getElementById('auth-link');

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

    if (result.status !== 'success') {
      productsContainer.innerHTML = `<h3>Error loading products</h3>`;
      return;
    }

    productsContainer.innerHTML = '';

    result.data.forEach((product) => {
      let classes = 'grid-item col-6 col-md-4 col-lg-3';

      if (product.isBest) classes += ' best';
      if (product.isFeatured) classes += ' feat';
      if (product.isNew) classes += ' new';

      const html = `
      <div class="${classes}">
        <div class="card h-100">
          <a href="details.html?id=${product.id}" class="text-decoration-none d-block">
            <img src="${product.image}" class="card-img-top" alt="${product.name}"></a>
          <div class="card-body text-center d-flex flex-column">
            <h5 class="card-title">${product.name}</h5>
            <p class="card-text mb-2">${product.price} EGP</p>
            <button class="btn btn-primary add-to-cart" data-id="${product.id}">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    `;

      productsContainer.insertAdjacentHTML('beforeend', html);
    });

    // Initialize Isotope after images load so layout height is correct (fixes "only images visible" on first load)
    const $gridEl = $('#products-container');
    $gridEl.imagesLoaded(function () {
      const $grid = $gridEl.isotope({
        itemSelector: '.grid-item',
        layoutMode: 'fitRows',
      });

      $('.filter-button-group').on('click', 'button', function () {
        $('.filter-button-group .btn').removeClass('active-filter-btn');
        $(this).addClass('active-filter-btn');

        const filterValue = $(this).attr('data-filter');
        $grid.isotope({ filter: filterValue });
      });
    });
  }

  // ================= ADD TO CART =================
  productsContainer.addEventListener('click', async (e) => {
    if (!e.target.classList.contains('add-to-cart')) return;

    const auth = isAuthenticated();

    if (auth.status !== 'success') {
      window.location.href = 'login.html';
      return;
    }

    const productId = e.target.dataset.id;

    const res = await addToCart(productId, 1);

    if (res.status === 'success') {
      console.log('here');
      updateCartCount();
    } else {
      alert(res.message || 'Failed');
    }
  });

  loadProducts();

  const searchForm = document.getElementById('searchForm');
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchInput = document.getElementById('searchInput').value;

    // loadProducts({search: searchInput})
    window.location.href = `collection.html?search=${searchInput}`;
  });
});
