// frontend/js/dashboard.js
import { apiRequest } from "./api.js";
import { toast } from "./ui.js";

export async function initDashboardSummary() {
  try {
    const data = await apiRequest("/tasks/summary", { method: "GET" });

    document.getElementById("summaryText").textContent =
      `Total: ${data.total} | Completed: ${data.completed} | Pending: ${data.pending}`;

    document.getElementById("summaryPercent").textContent = data.percent;
    document.getElementById("progressBar").style.width = `${data.percent}%`;
  } catch (e) {
    toast(e.message, "error");
  }
}
