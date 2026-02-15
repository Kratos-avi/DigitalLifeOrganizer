function renderNavbar() {
  const nav = document.getElementById("navArea");
  if (!nav) return;

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;

  // Brand link
  let brandLink = "index.html";
  if (user && user.role === "newcomer") brandLink = "newcomer.html";
  if (user && user.role === "admin") brandLink = "admin.html";

  // Dashboard link
  let dashboardLink = "newcomer.html";
  if (user && user.role === "admin") dashboardLink = "admin.html";

  nav.innerHTML = `
    <nav class="navbar navbar-expand-lg">
      <div class="container py-2 d-flex justify-content-between align-items-center">

        <a class="navbar-brand fw-bold d-flex align-items-center gap-2 m-0" href="${brandLink}">
          <span class="brand-dot"></span>
          <span>Digital Life Organizer</span>
        </a>

        <div class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
          ${
            token && user
              ? `
                <a class="btn btn-outline-dark btn-sm" href="${dashboardLink}">Dashboard</a>
                <a class="btn btn-outline-dark btn-sm" href="deadlines.html">Deadlines</a>
                <a class="btn btn-outline-dark btn-sm" href="announcements.html">Announcements</a>

                <span class="small-muted ms-2">
                  ${user.email} (${user.role})
                </span>

                <button class="btn btn-dark btn-sm" onclick="logout()">Logout</button>
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
