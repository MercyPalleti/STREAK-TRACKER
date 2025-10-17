import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/auth/login";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(API_URL, form);
    localStorage.setItem("token", res.data.token);
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button>Login</button>
      </form>
      <p onClick={() => navigate("/signup")} style={{ cursor: "pointer", color: "blue" }}>
        Don’t have an account? Signup
      </p>
    </div>
  );
}

const styles = { container: { textAlign: "center", marginTop: 50 }, form: { display: "flex", flexDirection: "column", gap: 10, width: 300, margin: "auto" } };
