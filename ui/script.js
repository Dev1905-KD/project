let tasks = [];
let goal = 0;

const API_URL = "https://project-2hdc.onrender.com";

// ✅ USE SAME KEY AS LOGIN
const authUser = localStorage.getItem("authUser");

window.addEventListener("DOMContentLoaded", () => {

    // 🔥 AUTH CHECK FIXED
    if (!authUser) {
        window.location.href = "/login.html";
        return;
    }

    // Welcome text
    const welcomeText = document.getElementById("welcomeText");
    if (welcomeText) {
        welcomeText.innerText = `Welcome, ${authUser}!`;
    }

    loadTasks();
});

// ==============================
// 📥 LOAD TASKS
// ==============================
async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks/${authUser}`);
        const dbTasks = await response.json();

        tasks = dbTasks.map(t => t.title);

        renderTasks();
        updateProgress();

    } catch (err) {
        console.error("Failed to load tasks:", err);
    }
}

// ==============================
// 📝 RENDER TASKS
// ==============================
function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    tasks.forEach(task => {
        let li = document.createElement("li");
        li.textContent = task;
        taskList.appendChild(li);
    });
}

// ==============================
// ➕ ADD TASK
// ==============================
async function addTask() {
    let input = document.getElementById("taskInput");

    if (input.value.trim() === "") return;

    try {
        const response = await fetch(`${API_URL}/add-task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: authUser,   // 🔥 IMPORTANT FIX
                title: input.value
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            input.value = "";
            await loadTasks();
        } else {
            alert(data.error || "Failed to add task");
        }

    } catch (err) {
        console.error(err);
    }
}

// ==============================
// 🎯 SET GOAL
// ==============================
function setGoal() {
    goal = document.getElementById("goalInput").value;

    document.getElementById("goalText").innerText =
        "Goal: " + goal + " tasks";

    updateProgress();
}

// ==============================
// 📊 UPDATE PROGRESS
// ==============================
function updateProgress() {
    if (goal == 0) return;

    let percent = (tasks.length / goal) * 100;
    percent = Math.min(percent, 100);

    document.getElementById("progressBar").style.width = percent + "%";

    document.getElementById("progressText").innerText =
        Math.floor(percent) + "% Completed";
}

// ==============================
// ❌ DELETE TASKS
// ==============================
async function deleteAllTasks() {
    if (!confirm("Are you sure you want to delete all tasks?")) return;

    try {
        const response = await fetch(`${API_URL}/delete-all-tasks/${authUser}`, {
            method: "DELETE"
        });

        if (response.ok) {
            tasks = [];
            renderTasks();
            updateProgress();
        }

    } catch (err) {
        console.error(err);
    }
}

// ==============================
// 🔓 LOGOUT
// ==============================
function logout() {
    localStorage.removeItem("authUser"); // 🔥 FIXED
    window.location.href = "/login.html";
}

// ==============================
// 🔝 SCROLL
// ==============================
function scrollTopPage() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}