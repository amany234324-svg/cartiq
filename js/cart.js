import { getCurrentUserCartPopulated } from '../data/cart.js';

import { hasRole } from '../data/auth.js';

if (hasRole('customer').status !== 'success') {
  window.location.href = 'login.html';
}

const addCartButtons = document.querySelectorAll('.btn-cart');

addCartButtons.forEach((btn) => {
  btn.addEventListener('click', async (e) => {
    const card = e.target.closest('.product-card');
    const name = card.querySelector('.card-title').textContent;
    const price = parseInt(card.querySelector('.price').textContent);
    const img = card.querySelector('img').src;

    // جلب Cart من Local Storage
    // let cart = JSON.parse(localStorage.getItem("cart")) || [];
    // const cart = await getCurrentUserCartPopulated();

    // التحقق إذا المنتج موجود بالفعل
    // const existingIndex = cart.findIndex(item => item.name === name);
    // if(existingIndex >= 0){
    //   cart[existingIndex].quantity += 1;
    // } else {
    //   cart.push({name, price, img, quantity:1});
    // }

    // localStorage.setItem("cart", JSON.stringify(cart));

    // تحديث Navbar Badge
    const cartCountEl = document.getElementById('cart-count');
    cartCountEl.textContent = cart.reduce((a, b) => a + b.quantity, 0);
  });
});
