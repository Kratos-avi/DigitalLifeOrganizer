function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

function redirectByRole(user) {
  if (user.role === "admin") {
    window.location.href = "admin.html";
  } else {
    window.location.href = "newcomer.html";
  }
}
