import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import TaskTracker from "./TaskTracker";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={token ? <TaskTracker /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
