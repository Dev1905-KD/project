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

    const input = document.getElementById("emailInput").value.trim(); // 🔥 rename
    const password = document.getElementById("passwordInput").value;

    if (!input || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                input: input,      // 🔥 IMPORTANT FIX
                password: password
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            localStorage.setItem("authUser", input);
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert(data.message || "Invalid credentials");
        }

    } catch (err) {
        console.error(err);
        alert("Unable to connect to server");
    }
}

async function registerUser(event) {
    event.preventDefault();

    const fullname = document.getElementById("nameInput").value.trim();
    const email = document.getElementById("registerEmailInput").value.trim();
    const password = document.getElementById("registerPasswordInput").value;

    if (!fullname || !email || !password) {
        alert("Please complete all fields.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: email,   // 🔥 REQUIRED
                fullname: fullname,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration successful!");
            showLogin();
        } else {
            alert(data.error || data.message);
        }

    } catch (err) {
        console.error(err);
        alert("Unable to connect to server");
    }
}

function saveAuthData(data, name) {
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authName", name || data.user?.name || data.email || "Member");
}
