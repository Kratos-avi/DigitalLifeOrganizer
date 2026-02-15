function renderNavbar() {
  const nav = document.getElementById("navArea");
  if (!nav) return;

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;

  let leftLink = "index.html";
  if (user && user.role === "newcomer") leftLink = "newcomer.html";
  if (user && user.role === "admin") leftLink = "admin.html";

  nav.innerHTML = `
  <nav class="navbar navbar-expand-lg bg-white border-bottom">
    <div class="container py-2">
      <a class="navbar-brand" href="${leftLink}">Digital Life Organizer</a>

      <div class="d-flex align-items-center gap-2">
        ${
          token && user
            ? `
              <span class="small text-muted">${user.email} (${user.role})</span>
              <button class="btn btn-outline-dark btn-sm" onclick="logout()">Logout</button>
            `
            : `
              <a class="btn btn-outline-dark btn-sm" href="index.html">Login</a>
              <a class="btn btn-dark btn-sm" href="register.html">Register</a>
            `
        }
      </div>
    </div>
  </nav>
  `;
}
