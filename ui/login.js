const API_URL = "https://project-2hdc.onrender.com";

window.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("authToken")) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("loginForm").addEventListener("submit", loginUser);
    document.getElementById("registerForm").addEventListener("submit", registerUser);
});

function showRegister() {
    document.getElementById("loginCard").classList.add("hidden");
    document.getElementById("registerCard").classList.remove("hidden");
}

function showLogin() {
    document.getElementById("registerCard").classList.add("hidden");
    document.getElementById("loginCard").classList.remove("hidden");
}

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value.trim();
    const password = document.getElementById("passwordInput").value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            saveAuthData(data, email);
            window.location.href = "index.html";
        } else {
            alert(`Login failed: ${data.error || data.message || "Please try again."}`);
        }
    } catch (err) {
        console.error("Login error:", err);
        alert("Unable to connect to the server. Please try again later.");
    }
}

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("registerEmailInput").value.trim();
    const password = document.getElementById("registerPasswordInput").value;

    if (!name || !email || !password) {
        alert("Please complete all fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            saveAuthData(data, name);
            window.location.href = "index.html";
        } else {
            alert(`Registration failed: ${data.error || data.message || "Please try again."}`);
        }
    } catch (err) {
        console.error("Registration error:", err);
        alert("Unable to connect to the server. Please try again later.");
    }
}

function saveAuthData(data, name) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authName", name || data.user?.name || data.email || "Member");
}
