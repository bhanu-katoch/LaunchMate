// auth.js - handles signup and login forms
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signup-form");
  const loginForm = document.getElementById("login-form");

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const resEl = document.getElementById("signup-result");

      try {
        const r = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ username, email, password }),
        });
        const data = await r.json();
        if (!r.ok) throw data;
        resEl.textContent = data.message || "Signed up";
        // redirect to login
        setTimeout(() => (window.location.href = "/login"), 800);
      } catch (err) {
        resEl.textContent = err.message || JSON.stringify(err);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const resEl = document.getElementById("login-result");

      try {
        const r = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ email, password }),
        });
        const data = await r.json();
        if (!r.ok) throw data;
        resEl.textContent = data.message || "Logged in";
        setTimeout(() => (window.location.href = "/chat"), 500);
      } catch (err) {
        resEl.textContent = err.message || JSON.stringify(err);
      }
    });
  }
});
