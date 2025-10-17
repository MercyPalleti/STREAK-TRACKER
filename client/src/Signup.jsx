import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth/signup";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(API_URL, form);
    localStorage.setItem("token", res.data.token);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button>Signup</button>
      </form>
      <p onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "blue" }}>
        Already have an account? Login
      </p>
    </div>
  );
}

const styles = { container: { textAlign: "center", marginTop: 50 }, form: { display: "flex", flexDirection: "column", gap: 10, width: 300, margin: "auto" } };
