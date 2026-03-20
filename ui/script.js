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

        if (response.ok) {
            tasks.push(input.value);
            renderTasks();
            input.value = "";
            updateProgress();
        }
    } catch (err) {
        console.error("Failed to add task:", err);
        alert("Error adding task. Make sure backend is running on port 5000");
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

function scrollTopPage() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
