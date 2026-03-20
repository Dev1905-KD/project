let tasks = [];
let goal = 0;
const API_URL = "https://project-2hdc.onrender.com";

// Load tasks from backend on page load
window.addEventListener("DOMContentLoaded", loadTasks);

async function loadTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        const dbTasks = await response.json();
        tasks = dbTasks.map(t => t.title);
        renderTasks();
        updateProgress();
    } catch (err) {
        console.error("Failed to load tasks:", err);
    }
}

function renderTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    tasks.forEach(task => {
        let li = document.createElement("li");
        li.textContent = task;
        taskList.appendChild(li);
    });
}

async function addTask() {

    let input = document.getElementById("taskInput");

    if (input.value === "") return;

    try {
        const response = await fetch(`${API_URL}/add-task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: input.value })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            input.value = "";
            // Reload tasks from database to ensure they're saved
            await loadTasks();
        } else {
            alert(`Error: ${data.error || "Failed to add task"}`);
        }
    } catch (err) {
        console.error("Failed to add task:", err);
        alert(`Error: ${err.message}`);
    }
}

function setGoal() {

    goal = document.getElementById("goalInput").value;

    document.getElementById("goalText").innerText =
        "Goal: " + goal + " tasks";

    updateProgress();
}

function updateProgress() {

    if (goal == 0) return;

    let percent = (tasks.length / goal) * 100;
    percent = Math.min(percent, 100);

    document.getElementById("progressBar").style.width = percent + "%";

    document.getElementById("progressText").innerText =
        Math.floor(percent) + "% Completed";
}

async function deleteAllTasks() {
    if (!confirm("Are you sure you want to delete all tasks?")) return;

    try {
        const response = await fetch(`${API_URL}/delete-all-tasks`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            tasks = [];
            renderTasks();
            updateProgress();
            alert("All tasks cleared!");
        } else {
            console.error("Backend error:", data);
            alert(`Error: ${data.error || data.message || "Error clearing tasks"}`);
        }
    } catch (err) {
        console.error("Failed to delete tasks:", err);
        alert(`Connection error: ${err.message}`);
    }
}

function scrollTopPage() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
