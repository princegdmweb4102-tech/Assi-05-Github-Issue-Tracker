const CREDENTIALS = { username: "admin", password: "admin123" };
const REDIRECT_PAGE = "dashboard.html";
const STORAGE_KEY = "login";

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const isValid = username === CREDENTIALS.username && password === CREDENTIALS.password;

  if (isValid) {
    localStorage.setItem(STORAGE_KEY, "true");
    window.location.href = REDIRECT_PAGE;
    return;
  }

  alert("Invalid Login");
}
