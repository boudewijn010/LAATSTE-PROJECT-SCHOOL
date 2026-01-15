const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// Database setup
const db = new sqlite3.Database("./tasks.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(
    `
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,
    (err) => {
      if (err) {
        console.error("Error creating table:", err);
      } else {
        console.log("Tasks table initialized");
      }
    }
  );
}

// API Routes

// Get all tasks
app.get("/api/tasks", (req, res) => {
  db.all("SELECT * FROM tasks ORDER BY created_at DESC", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single task
app.get("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM tasks WHERE id = ?", [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json(row);
  });
});

// Create new task
app.post("/api/tasks", (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  db.run(
    "INSERT INTO tasks (title, description) VALUES (?, ?)",
    [title, description || ""],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({
        id: this.lastID,
        title,
        description: description || "",
        completed: 0,
        created_at: new Date().toISOString(),
      });
    }
  );
});

// Update task
app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;

  let updateFields = [];
  let updateValues = [];

  if (title !== undefined) {
    updateFields.push("title = ?");
    updateValues.push(title);
  }
  if (description !== undefined) {
    updateFields.push("description = ?");
    updateValues.push(description);
  }
  if (completed !== undefined) {
    updateFields.push("completed = ?");
    updateValues.push(completed ? 1 : 0);
  }

  updateFields.push("updated_at = CURRENT_TIMESTAMP");
  updateValues.push(id);

  const query = `UPDATE tasks SET ${updateFields.join(", ")} WHERE id = ?`;

  db.run(query, updateValues, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ message: "Task updated successfully" });
  });
});

// Delete task
app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM tasks WHERE id = ?", [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    res.json({ message: "Task deleted successfully" });
  });
});

// Delete all completed tasks
app.delete("/api/tasks/completed/all", (req, res) => {
  db.run("DELETE FROM tasks WHERE completed = 1", function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: `${this.changes} completed tasks deleted` });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Task Manager API running at http://localhost:${PORT}`);
});
