// frontend/js/api.js
// ✅ LOCAL ONLY
const BASE_URL = "http://localhost:5000/api";

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
  } finally {
    if (typeof showLoader === "function") showLoader(false);
  }
}
