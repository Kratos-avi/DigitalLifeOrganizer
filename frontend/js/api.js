// frontend/js/api.js
function normalizeApiBaseUrl(value) {
  if (!value || typeof value !== "string") return "";
  const v = value.trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(v)) return "";
  return v;
}

// 🔥 CHANGE HERE (IMPORTANT)
const DEFAULT_API_BASE_URL = window.location.origin + "/api";

const CONFIGURED_API_BASE_URL =
  normalizeApiBaseUrl(window.API_BASE_URL) ||
  normalizeApiBaseUrl(localStorage.getItem("API_BASE_URL"));

const BASE_URL = CONFIGURED_API_BASE_URL || DEFAULT_API_BASE_URL;

window.getApiBaseUrl = function () {
  return BASE_URL;
};

async function apiRequest(path, method = "GET", body = null, auth = true) {
  const headers = {};

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) headers["Authorization"] = "Bearer " + token;
  }

  if (body !== null) headers["Content-Type"] = "application/json";

  try {
    if (typeof showLoader === "function") showLoader(true);

    const res = await fetch(BASE_URL + path, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : null
    });

    const isJson = res.headers.get("content-type")?.includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      if ((res.status === 401 || res.status === 403) && auth) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      const msg = data?.message || "Something went wrong.";
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Cannot reach backend API. Check AWS backend (/api) and CORS.");
    }

    if ((/token|unauthorized|forbidden|jwt|expired/i).test(String(err.message || "")) && auth) {
      throw new Error("Session expired or unauthorized. Please login again.");
    }

    throw err;
  } finally {
    if (typeof showLoader === "function") showLoader(false);
  }
}
