const API_URL = "/api";

async function apiRequest(endpoint, method = "GET", data = null, isFormData = false) {
    const token = localStorage.getItem("token");
    const headers = {
        'Cache-Control': 'no-cache'
    };
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers["Authorization"] = `Bearer ${token}`; // تم تصحيح الباك تيك هنا
    }

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = isFormData ? data : JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options); // تم تصحيح الباك تيك هنا
        
        // Handle Unauthorized/Forbidden
        if (response.status === 401 || response.status === 403) { // تم إضافة 
            localStorage.removeItem("token");
            window.location.href = "/login.html";
            throw new Error("Unauthorized");
        }

        const result = await response.json();

        if (!response.ok) {
            // Extract the most descriptive error message available
            const errorMsg = result.error || result.message || result.msg || `Request failed with status ${response.status}`;
            throw new Error(errorMsg);
        }

        return result;
    } catch (error) {
        throw error;
    } finally {
        const loadingOverlay = document.getElementById("loading-overlay");
        if (loadingOverlay) {
            loadingOverlay.style.display = "none";
        }
    }
}

// Data fetching helpers
const api = {
    get: (endpoint) => apiRequest(endpoint),
    post: (endpoint, data) => apiRequest(endpoint, "POST", data),
    put: (endpoint, data) => apiRequest(endpoint, "PUT", data),
    delete: (endpoint) => apiRequest(endpoint, "DELETE")
};

window.api = api;