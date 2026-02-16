import { login, isAuthenticated } from '../data/auth.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

if (isAuthenticated().status === 'success') {
  if (isAuthenticated().token.role === 'customer')
    window.location.href = 'Home.html';
  else window.location.href = 'admin-dashboard.html';
}

// Toggle password visibility
document
  .querySelector('.toggle-password')
  ?.addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      this.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      this.classList.replace('fa-eye-slash', 'fa-eye');
    }
  });

// Login form submission
document
  .getElementById('loginForm')
  ?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const errorMsg = document.getElementById('errorMsg');
    const loginBtn = document.getElementById('loginBtn');

    if (!email || !password) {
      errorMsg.textContent = 'Please enter email and password';
      errorMsg.classList.remove('d-none');
      return;
    }

    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm"></span> Signing in...';
    }

    try {
      const result = await login(email, password);

      console.log('Login result:', result);

      if (result.status === 'success') {
        errorMsg.classList.remove('text-danger');
        errorMsg.classList.add('text-success');
        errorMsg.textContent = '...';
        errorMsg.classList.remove('d-none');

        if (result.data.role === 'customer') {
          setTimeout(() => {
            window.location.href = 'Home.html';
          }, 1200);
        } else {
          setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
          }, 1200);
        }
      } else {
        errorMsg.textContent = result.message || 'Incorrect email or password';
        errorMsg.classList.remove('text-success');
        errorMsg.classList.add('text-danger');
        errorMsg.classList.remove('d-none');
      }
    } catch (err) {
      console.error('Login error:', err);
      errorMsg.textContent = '';
      errorMsg.classList.remove('d-none');
    } finally {
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Get Started';
      }
    }
    if (result.status === 'success') {
      errorMsg.classList.remove('text-danger');
      errorMsg.classList.add('text-success');
      errorMsg.textContent = '';
      errorMsg.classList.remove('d-none');

      setTimeout(() => {
        window.location.href = 'Home.html';
      }, 1200);
    }
  });
