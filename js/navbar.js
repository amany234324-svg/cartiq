
  import { isAuthenticated, getCurrentUser } from './data/auth.js';
  import { getCurrentUserCart } from './data/cart.js';

  async function initNavbar() {
    // انتظري شوية لحد ما الـ navbar يتحمل
    setTimeout(async () => {
      const authLink = document.getElementById('auth-link');
      const cartCount = document.getElementById('cart-count');

      if (!authLink || !cartCount) return;

      const auth = isAuthenticated();
      if (auth.status === 'success') {
        const userRes = await getCurrentUser();
        if (userRes.status === 'success') {
          const user = userRes.data;
          authLink.innerHTML = `
            Welcome, ${user.name}
            <a href="#" id="logout-link" class="ms-3 text-danger">Logout</a>
          `;
          document.getElementById('logout-link')?.addEventListener('click', e => {
            e.preventDefault();
            localStorage.removeItem('token');
            window.location.reload();
          });
        }
      }

      // عدد السلة
      const cartRes = await getCurrentUserCart();
      if (cartRes.status === 'success' && cartRes.data?.items) {
        cartCount.textContent = cartRes.data.items.length;
      } else {
        cartCount.textContent = '0';
      }
    }, 500); // تأخير بسيط عشان الـ DOM يتحمل
  }

  document.addEventListener('DOMContentLoaded', initNavbar);
// js/navbar.js
import { getCurrentUser } from '../auth.js';   // ← عدلي المسار لو auth.js في مكان تاني

document.addEventListener("DOMContentLoaded", async () => {
    const authLink = document.getElementById("auth-link");
    if (!authLink) return;

    // الطريقة الأفضل: نستعلم عن المستخدم من الـ backend باستخدام الـ token
    const result = await getCurrentUser();

    if (result.status === "success" && result.data?.name) {
        const name = result.data.name;
        authLink.innerHTML = `Hi, ${name} <i class="fas fa-user ms-1"></i>`;
        authLink.href = "#";  // أو ممكن تخليه يروح على صفحة profile لو عندك

        // إضافة زر تسجيل خروج عند الضغط
        authLink.addEventListener("click", (e) => {
            e.preventDefault();
            if (confirm("هل تريد تسجيل الخروج؟")) {
                localStorage.removeItem("token");
                localStorage.removeItem("userName"); // اختياري
                window.location.href = "login.html";
            }
        });
    } else {
        // مش مسجل دخول
        authLink.innerHTML = 'Login <i class="fas fa-sign-in-alt ms-1"></i>';
        authLink.href = "login.html";
    }
});