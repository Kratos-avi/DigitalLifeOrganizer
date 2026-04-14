// frontend/js/api.js
const BASE_URL =
  window.API_BASE_URL ||
  localStorage.getItem("API_BASE_URL") ||
  "https://digitallifeorganizer-production.up.railway.app/api";

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
      const msg = data?.message || "Something went wrong.";
      throw new Error(msg);
    }

    return data;
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error("Cannot reach backend API. Set correct API URL and check CORS/deployment.");
    }
    throw err;
  } finally {
    if (typeof showLoader === "function") showLoader(false);
  }
}
