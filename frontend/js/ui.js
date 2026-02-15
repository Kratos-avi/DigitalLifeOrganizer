// frontend/js/ui.js

(function () {
  function ensureContainers() {
    if (!document.getElementById("globalLoader")) {
      const loader = document.createElement("div");
      loader.id = "globalLoader";
      loader.className = "loader-overlay d-none";
      loader.innerHTML = `<div class="spinner-border text-light" role="status"></div>`;
      document.body.appendChild(loader);
    }

    if (!document.getElementById("toastContainer")) {
      const c = document.createElement("div");
      c.id = "toastContainer";
      c.className = "toast-container position-fixed top-0 end-0 p-3";
      c.style.zIndex = "9999";
      document.body.appendChild(c);
    }
  }

  window.showLoader = function (show) {
    ensureContainers();
    const el = document.getElementById("globalLoader");
    if (!el) return;
    el.classList.toggle("d-none", !show);
  };

  window.toast = function (message, type = "success") {
    ensureContainers();

    const container = document.getElementById("toastContainer");
    const id = "t_" + Date.now();

    const bg =
      type === "error" ? "bg-danger" :
      type === "info" ? "bg-info" :
      type === "warning" ? "bg-warning" :
      "bg-success";

    const html = `
      <div id="${id}" class="toast align-items-center text-white ${bg} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="d-flex">
          <div class="toast-body">${String(message || "")}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", html);
    const toastEl = document.getElementById(id);

    try {
      const t = new bootstrap.Toast(toastEl, { delay: 2500 });
      t.show();
      toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    } catch (e) {
      // fallback if bootstrap not loaded
      alert(message);
      toastEl.remove();
    }
  };
})();
