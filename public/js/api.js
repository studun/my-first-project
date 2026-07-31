const API_URL = "/api";

async function apiRequest(endpoint, method = "GET", data = null, isFormData = false) {
    const token = localStorage.getItem("token");
    const headers = {};
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    if (token) {
        headers["x-auth-token"] = token;
    }

    const options = {
        method,
        headers
    };

    if (data) {
        options.body = isFormData ? data : JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.msg || "Something went wrong");
    }

    return result;
}
