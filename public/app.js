const API_URL = "http://localhost:3000/api";
let tasks = [];
let currentFilter = "all";

// DOM Elements
const taskInput = document.getElementById("taskInput");
const descriptionInput = document.getElementById("descriptionInput");
const addBtn = document.getElementById("addBtn");
const tasksList = document.getElementById("tasksList");
const emptyState = document.getElementById("emptyState");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const clearCompletedBtn = document.getElementById("clearCompleted");

// Filter buttons
const filterAllBtn = document.getElementById("filterAll");
const filterPendingBtn = document.getElementById("filterPending");
const filterCompletedBtn = document.getElementById("filterCompleted");

// Event listeners
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

filterAllBtn.addEventListener("click", () => setFilter("all"));
filterPendingBtn.addEventListener("click", () => setFilter("pending"));
filterCompletedBtn.addEventListener("click", () => setFilter("completed"));
clearCompletedBtn.addEventListener("click", deleteCompletedTasks);

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

// Load tasks from API
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    if (!response.ok) throw new Error("Failed to load tasks");
    tasks = await response.json();
    renderTasks();
  } catch (error) {
    console.error("Error loading tasks:", error);
    showError("Kon taken niet laden");
  }
}

// Add new task
async function addTask() {
  const title = taskInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    alert("Voer een taaknaam in");
    taskInput.focus();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!response.ok) throw new Error("Failed to add task");
    const newTask = await response.json();
    tasks.push(newTask);
    taskInput.value = "";
    descriptionInput.value = "";
    renderTasks();
  } catch (error) {
    console.error("Error adding task:", error);
    showError("Kon taak niet toevoegen");
  }
}

// Toggle task completion
async function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });

    if (!response.ok) throw new Error("Failed to update task");
    task.completed = !task.completed;
    renderTasks();
  } catch (error) {
    console.error("Error toggling task:", error);
    showError("Kon taak niet bijwerken");
  }
}

// Delete task
async function deleteTask(id) {
  if (!confirm("Zeker dat je deze taak wilt verwijderen?")) return;

  try {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete task");
    tasks = tasks.filter((t) => t.id !== id);
    renderTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
    showError("Kon taak niet verwijderen");
  }
}

// Delete completed tasks
async function deleteCompletedTasks() {
  if (!confirm("Alle voltooide taken verwijderen?")) return;

  try {
    const response = await fetch(`${API_URL}/tasks/completed/all`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete completed tasks");
    tasks = tasks.filter((t) => !t.completed);
    renderTasks();
  } catch (error) {
    console.error("Error deleting completed tasks:", error);
    showError("Kon voltooide taken niet verwijderen");
  }
}

// Set filter
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (filter === "all") filterAllBtn.classList.add("active");
  else if (filter === "pending") filterPendingBtn.classList.add("active");
  else if (filter === "completed") filterCompletedBtn.classList.add("active");

  renderTasks();
}

// Render tasks
function renderTasks() {
  let filteredTasks = tasks;

  if (currentFilter === "pending") {
    filteredTasks = tasks.filter((t) => !t.completed);
  } else if (currentFilter === "completed") {
    filteredTasks = tasks.filter((t) => t.completed);
  }

  tasksList.innerHTML = "";

  if (filteredTasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    filteredTasks.forEach((task) => {
      const taskEl = createTaskElement(task);
      tasksList.appendChild(taskEl);
    });
  }

  updateStats();
}

// Create task element
function createTaskElement(task) {
  const div = document.createElement("div");
  div.className = `task-item ${task.completed ? "completed" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task-checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const content = document.createElement("div");
  content.className = "task-content";

  const title = document.createElement("div");
  title.className = "task-title";
  title.textContent = task.title;

  const description = document.createElement("p");
  description.className = "task-description";
  description.textContent = task.description;

  const date = document.createElement("div");
  date.className = "task-date";
  date.textContent = new Date(task.created_at).toLocaleDateString("nl-NL");

  content.appendChild(title);
  if (task.description) content.appendChild(description);
  content.appendChild(date);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "task-delete";
  deleteBtn.textContent = "Verwijderen";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  div.appendChild(checkbox);
  div.appendChild(content);
  div.appendChild(deleteBtn);

  return div;
}

// Update statistics
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;

  totalTasksEl.textContent = total;
  completedTasksEl.textContent = completed;
  pendingTasksEl.textContent = pending;
}

// Show error message
function showError(message) {
  alert(message);
}
