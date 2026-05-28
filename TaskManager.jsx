import React, { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'task-manager-items-v1';

const priorityColors = {
  low: 'var(--low)',
  medium: 'var(--medium)',
  high: 'var(--high)',
};

const getTodayKey = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function TaskManager() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [removingTaskId, setRemovingTaskId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const statusMatch =
        statusFilter === 'all' ||
        (statusFilter === 'completed' ? task.completed : !task.completed);

      const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;

      return statusMatch && priorityMatch;
    });
  }, [tasks, statusFilter, priorityFilter]);

  const addTask = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newTask = {
      id: createId(),
      title: cleanTitle,
      description: description.trim(),
      priority,
      dueDate,
      completed: false,
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  const toggleComplete = (id) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const deleteTask = (id) => {
    setRemovingTaskId(id);
    setTimeout(() => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setRemovingTaskId(null);
    }, 220);
  };

  const today = getTodayKey();

  return (
    <div className="tm-root">
      <style>{`
        :root {
          --bg: #f5f7fb;
          --surface: #ffffff;
          --text: #101828;
          --muted: #667085;
          --line: #e4e7ec;
          --accent: #3b82f6;
          --low: #22c55e;
          --medium: #f59e0b;
          --high: #ef4444;
          --shadow: 0 12px 30px rgba(16, 24, 40, 0.08);
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #0b1020;
            --surface: #11182b;
            --text: #e5e7eb;
            --muted: #9ca3af;
            --line: #243046;
            --accent: #60a5fa;
            --shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          }
        }

        * { box-sizing: border-box; }

        .tm-root {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          padding: 1rem;
          font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .tm-card {
          width: min(100%, 920px);
          margin: 0 auto;
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: 18px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .tm-header {
          padding: 1.2rem 1.2rem 0.6rem;
        }

        .tm-title {
          margin: 0;
          font-size: clamp(1.2rem, 2.5vw, 1.6rem);
          font-weight: 700;
        }

        .tm-sub {
          margin: 0.35rem 0 0;
          color: var(--muted);
          font-size: 0.95rem;
        }

        .tm-form {
          display: grid;
          gap: 0.7rem;
          padding: 1rem 1.2rem;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }

        .tm-grid {
          display: grid;
          gap: 0.7rem;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        input, textarea, select, button {
          width: 100%;
          border-radius: 10px;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--text);
          padding: 0.65rem 0.8rem;
          font: inherit;
        }

        textarea { resize: vertical; min-height: 72px; }

        .tm-add {
          border: 0;
          background: var(--accent);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .tm-filters {
          padding: 1rem 1.2rem;
          display: grid;
          gap: 0.7rem;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          border-bottom: 1px solid var(--line);
        }

        .tm-list {
          display: grid;
          gap: 0.65rem;
          padding: 1rem 1.2rem 1.2rem;
        }

        .tm-task {
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 0.9rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 0.75rem;
          align-items: start;
          animation: tm-in 0.22s ease;
          transition: all 0.2s ease;
          background: color-mix(in srgb, var(--surface) 90%, var(--accent) 10%);
        }

        .tm-task.removing {
          opacity: 0;
          transform: translateX(10px) scale(0.98);
        }

        .tm-task.done {
          opacity: 0.75;
        }

        .tm-task.done .tm-task-title {
          text-decoration: line-through;
          color: var(--muted);
        }

        .tm-check {
          margin-top: 0.25rem;
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .tm-task-title {
          margin: 0;
          font-size: 1rem;
          line-height: 1.3;
        }

        .tm-task-desc {
          margin: 0.3rem 0 0;
          color: var(--muted);
          font-size: 0.9rem;
          white-space: pre-wrap;
        }

        .tm-meta {
          margin-top: 0.6rem;
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tm-badge {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 0.2rem 0.55rem;
          font-size: 0.78rem;
          color: var(--muted);
        }

        .tm-badge.priority {
          color: white;
          border: 0;
          font-weight: 600;
        }

        .tm-badge.overdue {
          color: #ef4444;
          border-color: #ef4444;
        }

        .tm-delete {
          border: 0;
          background: transparent;
          color: var(--muted);
          width: auto;
          cursor: pointer;
          padding: 0.1rem 0.2rem;
          font-size: 1.2rem;
          line-height: 1;
        }

        .tm-empty {
          border: 1px dashed var(--line);
          border-radius: 12px;
          padding: 2rem 1rem;
          text-align: center;
          color: var(--muted);
        }

        @keyframes tm-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 760px) {
          .tm-grid { grid-template-columns: 1fr; }
          .tm-filters { grid-template-columns: 1fr; }
          .tm-task { grid-template-columns: auto 1fr; }
          .tm-delete { justify-self: end; }
        }
      `}</style>

      <div className="tm-card">
        <header className="tm-header">
          <h1 className="tm-title">Task Manager</h1>
          <p className="tm-sub">Organize your tasks with priority, due dates, and filters.</p>
        </header>

        <form className="tm-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="Task title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="tm-grid">
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low priority</option>
              <option value="medium">Medium priority</option>
              <option value="high">High priority</option>
            </select>

            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

            <button className="tm-add" type="submit">
              Add Task
            </button>
          </div>
        </form>

        <div className="tm-filters">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>

          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="all">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <section className="tm-list">
          {filteredTasks.length === 0 ? (
            <div className="tm-empty">
              <p style={{ fontSize: '2rem', margin: 0 }}>🗂️</p>
              <p style={{ margin: '0.6rem 0 0' }}>No tasks match your filters yet.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const isOverdue = Boolean(task.dueDate && task.dueDate < today && !task.completed);
              return (
                <article
                  key={task.id}
                  className={`tm-task ${task.completed ? 'done' : ''} ${
                    removingTaskId === task.id ? 'removing' : ''
                  }`}
                >
                  <input
                    className="tm-check"
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task.id)}
                    aria-label={`Mark ${task.title} as complete`}
                  />

                  <div>
                    <h3 className="tm-task-title">{task.title}</h3>
                    {task.description ? <p className="tm-task-desc">{task.description}</p> : null}

                    <div className="tm-meta">
                      <span
                        className="tm-badge priority"
                        style={{ background: priorityColors[task.priority] || priorityColors.medium }}
                      >
                        {(task.priority || 'medium').toUpperCase()}
                      </span>
                      {task.dueDate ? (
                        <span className={`tm-badge ${isOverdue ? 'overdue' : ''}`}>
                          Due: {task.dueDate}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <button className="tm-delete" onClick={() => deleteTask(task.id)} aria-label="Delete task">
                    ×
                  </button>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
