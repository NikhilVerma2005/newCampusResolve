import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      const { user_id, role, office } = res.data;

      localStorage.setItem("userId", user_id);
      localStorage.setItem("role", role);
      if (office) localStorage.setItem("officeName", office);

      role === "STUDENT"
        ? navigate("/student")
        : navigate("/office/dashboard");

    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* Avatar Icon */}
        <div className="auth-avatar">
          <svg viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.2 4.8-4.8S14.7 2.4 12 2.4 7.2 4.6 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V22h19.2v-2.8c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>

        <div className="auth-title">Login to your account</div>

        <form onSubmit={handleLogin}>
          <input
            className="auth-input"
            placeholder="Email address"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="primary-btn">
            Login
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;
