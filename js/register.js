// js/register.js
import { register, isAuthenticated } from '../data/auth.js';
import { validateEmail, validatePassword } from '../utils/validation.js';

if (isAuthenticated().status === 'success') {
  if (isAuthenticated().token.role === 'customer')
    window.location.href = 'Home.html';
  else window.location.href = 'admin-dashboard.html';
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('Register page script loaded');

  const form = document.getElementById('registerForm');
  if (!form) {
    console.error("Form with id 'registerForm' not found");
    return;
  }

  const registerBtn = document.getElementById('registerBtn');
  const errorMsg = document.getElementById('errorMsg');
  const btnText = registerBtn?.querySelector('span') || registerBtn;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    errorMsg.classList.add('d-none');
    errorMsg.textContent = '';

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();
    const confirmPassword = document
      .getElementById('confirmPassword')
      ?.value.trim();

    
    const validatedEmail = validateEmail(email);
    console.log(validatedEmail);
    if (!validatedEmail.valid) {
      showError(validatedEmail.error);
      return;
    }

    const validatedPassword = validatePassword(password);
    console.log(validatedPassword);
    if (!validatedPassword.valid) {
      showError(validatedPassword.error);
      return;
    }

    

    if (password !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }

    console.log('Sending data:', { name, email, password: '••••••' });

    registerBtn.disabled = true;
    if (btnText) btnText.textContent = 'جاري التسجيل...';

    try {
      const result = await register({ name, email, password });
      console.log('Register response:', result);

      if (
        result?.status === 'success' ||
        result?.success === true ||
        result?.ok
      ) {
        console.log('Registration successful!');
        window.location.href = 'Home.html';
      } else {
        const msg = result?.message || result?.error || 'Registration failed';
        console.warn('Registration failed:', msg);
        showError(msg);
      }
    } catch (err) {
      console.error('Registration error:', err);
      showError('Connection error. Please try again later.');
    } finally {
      registerBtn.disabled = false;
      if (btnText) btnText.textContent = 'Register';
    }
  });

  function showError(message) {
    errorMsg.textContent = message;
    errorMsg.classList.remove('d-none');
  }
});
