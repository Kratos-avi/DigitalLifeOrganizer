// frontend/js/tasks.js
import { apiRequest } from "./api.js";
import { toast } from "./ui.js";

let state = {
  q: "",
  status: "all",
  page: 1,
  limit: 8,
  totalPages: 1,
  editingTaskId: null,
};

const els = {
  list: null,
  search: null,
  status: null,
  prev: null,
  next: null,
  pageInfo: null,
  editTitle: null,
  editDesc: null,
  saveEditBtn: null,
};

function getRole() {
  return localStorage.getItem("role"); // assuming you already store role
}

function setUpElements() {
  els.list = document.getElementById("taskList");
  els.search = document.getElementById("taskSearch");
  els.status = document.getElementById("taskStatus");
  els.prev = document.getElementById("btnPrev");
  els.next = document.getElementById("btnNext");
  els.pageInfo = document.getElementById("pageInfo");

  els.editTitle = document.getElementById("editTaskTitle");
  els.editDesc = document.getElementById("editTaskDesc");
  els.saveEditBtn = document.getElementById("saveEditTaskBtn");
}

function renderTasks(tasks) {
  if (!els.list) return;
  if (!tasks.length) {
    els.list.innerHTML = `<div class="text-muted">No tasks found.</div>`;
    return;
  }

  els.list.innerHTML = tasks.map(t => `
    <div class="glass-card p-3 mb-3">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-semibold">${escapeHtml(t.title)}</div>
          <div class="text-muted small">${escapeHtml(t.description || "")}</div>
          <div class="small mt-2">
            Status: <span class="${t.is_completed ? "text-success" : "text-warning"}">
              ${t.is_completed ? "Completed" : "Pending"}
            </span>
          </div>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm neon-btn" data-edit="${t.id}" data-title="${escapeAttr(t.title)}" data-desc="${escapeAttr(t.description || "")}">
            Edit
          </button>
        </div>
      </div>
    </div>
  `).join("");

  // Attach edit events
  els.list.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => openEditModal(
      btn.getAttribute("data-edit"),
      btn.getAttribute("data-title"),
      btn.getAttribute("data-desc")
    ));
  });
}

function updatePaginationUI() {
  els.pageInfo.textContent = `Page ${state.page} / ${state.totalPages}`;
  els.prev.disabled = state.page <= 1;
  els.next.disabled = state.page >= state.totalPages;
}

async function loadTasks() {
  try {
    const params = new URLSearchParams({
      q: state.q,
      status: state.status,
      page: String(state.page),
      limit: String(state.limit),
    });

    // If admin and you want to load a specific user’s tasks later, you can append user_id here.
    const data = await apiRequest(`/tasks?${params.toString()}`);

    state.totalPages = data.totalPages || 1;
    renderTasks(data.tasks || []);
    updatePaginationUI();
  } catch (e) {
    toast(e.message, "error");
  }
}

function openEditModal(id, title, desc) {
  state.editingTaskId = id;
  els.editTitle.value = title || "";
  els.editDesc.value = desc || "";

  const modalEl = document.getElementById("editTaskModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();
}

async function saveEdit() {
  try {
    const title = els.editTitle.value.trim();
    const description = els.editDesc.value.trim();

    if (!title) {
      toast("Title is required.", "error");
      return;
    }

    await apiRequest(`/tasks/${state.editingTaskId}`, {
      method: "PUT",
      body: JSON.stringify({ title, description }),
    });

    toast("Task updated ✅", "success");

    // Close modal
    const modalEl = document.getElementById("editTaskModal");
    bootstrap.Modal.getInstance(modalEl).hide();

    await loadTasks();
  } catch (e) {
    toast(e.message, "error");
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}
function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

export function initTasksPage() {
  setUpElements();

  els.search.addEventListener("input", (e) => {
    state.q = e.target.value;
    state.page = 1;
    loadTasks();
  });

  els.status.addEventListener("change", (e) => {
    state.status = e.target.value;
    state.page = 1;
    loadTasks();
  });

  els.prev.addEventListener("click", () => {
    state.page = Math.max(1, state.page - 1);
    loadTasks();
  });

  els.next.addEventListener("click", () => {
    state.page = Math.min(state.totalPages, state.page + 1);
    loadTasks();
  });

  els.saveEditBtn.addEventListener("click", saveEdit);

  loadTasks();
}
