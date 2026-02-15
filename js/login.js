import { login } from "../data/auth.js";
import { validateEmail, validatePassword } from "../utils/validation.js";

// Toggle password visibility
document.querySelector(".toggle-password")?.addEventListener("click", function () {
    const passwordInput = document.getElementById("password");
    if (!passwordInput) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        this.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        passwordInput.type = "password";
        this.classList.replace("fa-eye-slash", "fa-eye");
    }
});

// Login form submission
document.getElementById("loginForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const errorMsg = document.getElementById("errorMsg");
    const loginBtn = document.getElementById("loginBtn");

    if (!email || !password) {
        errorMsg.textContent = "Please enter email and password";
        errorMsg.classList.remove("d-none");
        return;
    }

    // اختياري: عرض حالة التحميل على الزر
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Signing in...';
    }

    try {
        // استدعاء دالة login من auth.js
        const result = await login(email, password);

        console.log("Login result:", result); // للتصحيح – يمكنك حذفه لاحقًا

        if (result.status === "success") {
            // حفظ اسم المستخدم (اختياري – مفيد لعرضه في الـ navbar لاحقًا)
            // localStorage.setItem("userName", result.data.name || "User");

            // عرض رسالة نجاح
            errorMsg.classList.remove("text-danger");
            errorMsg.classList.add("text-success");
            errorMsg.textContent = "تم تسجيل الدخول بنجاح! جاري التوجيه...";
            errorMsg.classList.remove("d-none");

            // الانتظار ثواني بسيطة عشان يشوف الرسالة (اختياري)
            if(result.data.role ==='customer') {

              setTimeout(() => {
                  window.location.href = "Home.html";  // ← غيري الاسم لو الملف مثلاً home.html أو index.html
              }, 1200); // 1.2 ثانية – يمكنك تقلليها أو تزوديها
            } else {
              setTimeout(() => {
                  window.location.href = "admin-dashboard.html";  // ← غيري الاسم لو الملف مثلاً home.html أو index.html
              }, 1200); // 1.2 ثانية – يمكنك تقلليها أو تزوديها
              
            }

        } else {
            // فشل تسجيل الدخول
            errorMsg.textContent = result.message || "Incorrect email or password";
            errorMsg.classList.remove("text-success");
            errorMsg.classList.add("text-danger");
            errorMsg.classList.remove("d-none");
        }
    } catch (err) {
        console.error("Login error:", err);
        errorMsg.textContent = "حدث خطأ في الاتصال بالخادم، حاول مرة أخرى";
        errorMsg.classList.remove("d-none");
    } finally {
        // إرجاع الزر لحالته الطبيعية
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = "Get Started";
        }
    }
    if (result.status === "success") {
    // حفظ الاسم عشان نستخدمه بسرعة في الـ navbar
    // localStorage.setItem("userName", result.data.name || result.data.email.split('@')[0]);

    // عرض رسالة نجاح
    errorMsg.classList.remove("text-danger");
    errorMsg.classList.add("text-success");
    errorMsg.textContent = "تم تسجيل الدخول بنجاح! جاري التوجيه...";
    errorMsg.classList.remove("d-none");

    setTimeout(() => {
        window.location.href = "Home.html";
    }, 1200);
}
});