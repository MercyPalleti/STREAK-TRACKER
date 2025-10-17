import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/tasks";

export default function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [streak, setStreak] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch tasks and streak
  const fetchData = async () => {
    const [taskRes, streakRes] = await Promise.all([
      axios.get(API_URL, { headers }),
      axios.get(`${API_URL}/streak`, { headers }),
    ]);
    setTasks(taskRes.data);
    setStreak(streakRes.data.streak);
  };

  useEffect(() => {
    if (!token) navigate("/login");
    else fetchData();
  }, []);

  // Add task
  const addTask = async (e) => {
    e.preventDefault();
    if (!title || !date) return alert("Please fill all fields");
    await axios.post(API_URL, { title, date }, { headers });
    setTitle("");
    setDate("");
    fetchData();
  };

  // Toggle task
  const toggleComplete = async (task) => {
    await axios.put(`${API_URL}/${task._id}`, { completed: !task.completed }, { headers });
    fetchData();
  };

  // Delete task
  const deleteTask = async (id) => {
    await axios.delete(`${API_URL}/${id}`, { headers });
    fetchData();
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <h1>🔥 Task Streak Tracker</h1>
      <h2>Current Streak: {streak} days</h2>
      <button onClick={logout} style={styles.logout}>Logout</button>

      <form onSubmit={addTask} style={styles.form}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <button>Add Task</button>
      </form>

      {tasks.map((task) => (
        <div key={task._id} style={styles.taskRow}>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => toggleComplete(task)}
          />
          <span style={{ textDecoration: task.completed ? "line-through" : "none" }}>
            {task.title} ({task.date})
          </span>
          <button onClick={() => deleteTask(task._id)}>❌</button>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: { textAlign: "center", marginTop: 50, fontFamily: "sans-serif" },
  form: { marginBottom: 20 },
  taskRow: {
    display: "flex",
    justifyContent: "space-between",
    width: 400,
    margin: "8px auto",
    padding: 10,
    background: "#eee",
    borderRadius: 8,
  },
  logout: { position: "absolute", right: 20, top: 20 },
};
