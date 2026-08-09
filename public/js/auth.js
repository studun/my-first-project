const loginScreen = document.getElementById("login-screen");
const mainApp = document.getElementById("main-app");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const userInfo = document.getElementById("user-info");
const loadingOverlay = document.getElementById("loading-overlay");

function setLoading(isLoading) {
    if (loadingOverlay) {
        if (isLoading) {
            loadingOverlay.style.display = "flex";
            loadingOverlay.classList.remove("d-none");
        } else {
            loadingOverlay.style.display = "none";
            loadingOverlay.classList.add("d-none");
        }
    }
}

/**
 * Initializes the main app UI and loads the dashboard
 */
function initApp(user) {
    userInfo.textContent = `${user.name} (${user.role})`;
    loginScreen.classList.add("d-none");
    mainApp.classList.remove("d-none");
    
    // Forcefully remove loading overlay
    if (loadingOverlay) {
        loadingOverlay.style.display = "none";
        loadingOverlay.classList.add("d-none");
    }
    
    loadSection("dashboard");
}

async function checkAuth() {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const { user } = await apiRequest("/auth/me");
            initApp(user);
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
    
    // Forcefully remove loading overlay
    if (loadingOverlay) {
        loadingOverlay.style.display = "none";
        loadingOverlay.classList.add("d-none");
    }
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    setLoading(true);
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const data = await apiRequest("/auth/login", "POST", { email, password });
        if (data.token) {
            localStorage.setItem("token", data.token);
            
            // Get user info and initialize app
            const { user } = await apiRequest("/auth/me");
            initApp(user);
        } else {
            throw new Error("No token received");
        }
    } catch (err) {
        alert(err.message);
    } finally {
        setLoading(false);
    }
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    showLogin();
});

document.addEventListener("DOMContentLoaded", checkAuth);
