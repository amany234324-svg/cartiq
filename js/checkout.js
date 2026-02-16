import { createOrder } from '../data/orders.js';
import { getCurrentUserCartPopulated } from '../data/cart.js';
import { hasRole } from '../data/auth.js';

if (hasRole('customer').status !== 'success') {
  window.location.href = 'login.html';
}

// Important page elements
const itemsContainer = document.getElementById('checkout-items');
const subtotalEl = document.getElementById('checkout-subtotal');
const taxEl = document.getElementById('checkout-tax');
const totalEl = document.getElementById('checkout-total');
const form = document.getElementById('checkoutForm');
const cartCountEl = document.getElementById('cart-count'); // in navbar

// Helper function to clean price values
function cleanPrice(str) {
  if (typeof str === 'number') return str;
  str = String(str || '0').replace(/[^0-9.]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

// ────────────────────────────────────────────────
// Render cart items in the checkout page
// ────────────────────────────────────────────────
async function renderCheckout() {
  itemsContainer.innerHTML = '<p class="text-muted text-center">Loading...</p>';

  const cartResponse = await getCurrentUserCartPopulated();

  if (cartResponse.status === 'fail') {
    itemsContainer.innerHTML = `<p class="text-muted text-center">Your cart is empty or an error occurred</p>`;
    subtotalEl.textContent = 'EGP 0.00';
    taxEl.textContent = 'EGP 0.00';
    totalEl.textContent = 'EGP 0.00';
    return;
  }

  const cart = cartResponse.data;
  const items = cart.items || [];

  if (items.length === 0) {
    itemsContainer.innerHTML = `<p class="text-muted text-center">Your cart is empty</p>`;
    subtotalEl.textContent = 'EGP 0.00';
    taxEl.textContent = 'EGP 0.00';
    totalEl.textContent = 'EGP 0.00';
    return;
  }

  itemsContainer.innerHTML = '';
  let subtotal = 0;

  items.forEach((item) => {
    const qty = Number(item.quantity) || 1;
    const price = cleanPrice(item.price);
    const itemTotal = price * qty;
    subtotal += itemTotal;

    itemsContainer.innerHTML += `
      <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-3">
        <div class="d-flex align-items-center">
          <img src="${item.image || 'https://via.placeholder.com/60'}" 
               alt="${item.name || 'Product'}" 
               width="60" class="me-3 rounded">
          <div>
            <div class="fw-bold">${item.name || 'Unknown Product'}</div>
            <small class="text-muted">Qty: ${qty}</small>
          </div>
        </div>
        <div class="fw-bold">EGP ${itemTotal.toFixed(2)}</div>
      </div>
    `;
  });

  const tax = subtotal * 0.14; // 14% VAT (Egypt)
  const total = subtotal + tax;

  subtotalEl.textContent = `EGP ${subtotal.toFixed(2)}`;
  taxEl.textContent = `EGP ${tax.toFixed(2)}`;
  totalEl.textContent = `EGP ${total.toFixed(2)}`;
}

// ────────────────────────────────────────────────
// Handle "Confirm & Place Order" button
// ────────────────────────────────────────────────
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Basic form validation (browser built-in)
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const formData = new FormData(form);

  const shippingInfo = {
    fullName: formData.get('fullName')?.trim() || '',
    phone: formData.get('phone')?.trim() || '',
    address: formData.get('address')?.trim() || '',
    city: formData.get('city')?.trim() || '',
    postalCode: formData.get('postalCode')?.trim() || '',
  };

  try {
    const orderResponse = await createOrder(shippingInfo);

    if (orderResponse.status === 'fail') {
      alert(
        'Failed to create order: ' + (orderResponse.message || 'Unknown error'),
      );
      return;
    }

    // Success → show toast notification
    const toast = new bootstrap.Toast(document.getElementById('successToast'));
    toast.show();

    // Redirect to orders page after short delay
    window.location.href = 'customer-order.html';
    // setTimeout(() => {
    //   window.location.href = "customer-order.html";
    // }, 1000);
  } catch (err) {
    console.error('Checkout error:', err);
    alert('An error occurred while placing the order\n' + err.message);
  }
});

// ────────────────────────────────────────────────
// Run when page loads
// ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await renderCheckout();
});
