const loginScreen = document.getElementById("login-screen");
const mainApp = document.getElementById("main-app");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");

async function checkAuth() {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const user = await apiRequest("/auth/me");
            userInfo.textContent = `${user.name} (${user.role})`;
            loginScreen.classList.add("d-none");
            mainApp.classList.remove("d-none");
            loadSection("dashboard");
        } catch (err) {
            localStorage.removeItem("token");
            showLogin();
        }
    } else {
        showLogin();
    }
}

function showLogin() {
    loginScreen.classList.remove("d-none");
    mainApp.classList.add("d-none");
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const { token } = await apiRequest("/auth/login", "POST", { email, password });
        localStorage.setItem("token", token);
        checkAuth();
    } catch (err) {
        alert(err.message);
    }
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    showLogin();
});

document.addEventListener("DOMContentLoaded", checkAuth);
