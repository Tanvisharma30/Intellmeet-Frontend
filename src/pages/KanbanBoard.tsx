import { useEffect, useState } from "react";

type Task = {
  _id: string;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  assignee?: string;
};

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  // fetch the task
  const fetchTasks = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // -add ur task
  const addTask = async () => {
    if (!title.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          status: "Todo",
        }),
      });

      const newTask = await res.json();
      setTasks((prev) => [...prev, newTask]);
      setTitle("");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // move the task
  const moveTask = async (id: string, status: Task["status"]) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const updated = await res.json();

      setTasks((prev) =>
        prev.map((t) => (t._id === id ? updated : t))
      );
    } catch (err) {
      console.log(err);
    }
  };

  // filters
  const todo = tasks.filter((t) => t.status === "Todo");
  const progress = tasks.filter((t) => t.status === "In Progress");
  const done = tasks.filter((t) => t.status === "Done");

  // ui
  return (
    <div style={styles.page}>
      <h2 style={styles.title}>Project Kanban Board</h2>

      {/* ADD TASK */}
      <div style={styles.inputRow}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task..."
          style={styles.input}
        />
        <button onClick={addTask} style={styles.addBtn}>
          {loading ? "Adding..." : "Add"}
        </button>
      </div>

      {/* BOARD */}
      <div style={styles.board}>
        {/* TODO */}
        <div style={styles.column}>
          <h3>📝 Todo</h3>
          {todo.map((t) => (
            <div key={t._id} style={styles.card}>
              <p>{t.title}</p>

              <button
                onClick={() => moveTask(t._id, "In Progress")}
                style={styles.btn}
              >
                Move →
              </button>
            </div>
          ))}
        </div>

        {/* IN PROGRESS */}
        <div style={styles.column}>
          <h3>⚙️ In Progress</h3>
          {progress.map((t) => (
            <div key={t._id} style={styles.card}>
              <p>{t.title}</p>

              <button
                onClick={() => moveTask(t._id, "Done")}
                style={styles.btn}
              >
                Move →
              </button>
            </div>
          ))}
        </div>

        {/* DONE */}
        <div style={styles.column}>
          <h3>✅ Done</h3>
          {done.map((t) => (
            <div key={t._id} style={styles.cardDone}>
              <p>{t.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles: any = {
  page: {
    padding: 20,
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "white",
  },

  title: {
    marginBottom: 20,
  },

  inputRow: {
    display: "flex",
    gap: 10,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: "1px solid #333",
    background: "#111",
    color: "white",
  },

  addBtn: {
    padding: "10px 15px",
    background: "#3b82f6",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  },

  board: {
    display: "flex",
    gap: 15,
  },

  column: {
    flex: 1,
    background: "#111",
    padding: 15,
    borderRadius: 10,
    minHeight: 400,
  },

  card: {
    background: "#1a1a1a",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  cardDone: {
    background: "#0f2a1a",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },

  btn: {
    marginTop: 8,
    padding: "5px 10px",
    background: "#333",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
  },
};