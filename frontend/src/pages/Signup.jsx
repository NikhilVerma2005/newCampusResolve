import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import "../App.css";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    office: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/signup", form);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        {/* Avatar Icon */}
        <div className="auth-avatar">
          <svg viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 
            5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 
            5v3h20v-3c0-3.3-6.7-5-10-5z"/>
          </svg>
        </div>

        <div className="auth-title">Create Account</div>

        <form onSubmit={handleSignup}>

          <input
            name="name"
            placeholder="Full Name"
            className="auth-input"
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            className="auth-input"
            onChange={handleChange}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            className="auth-input"
            onChange={handleChange}
            required
          />

          {/* Role Select */}
          <select
            name="role"
            className="auth-input"
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="STUDENT">Student</option>
            <option value="STAFF">Staff</option>
          </select>

          {/* Office Dropdown (Only for Staff) */}
          {form.role === "STAFF" && (
            <select
              name="office"
              className="auth-input"
              onChange={handleChange}
              required
            >
              <option value="">Select Office</option>
              <option value="HOSTEL_OFFICE">Hostel Office</option>
              <option value="ACADEMIC_OFFICE">Academic Office</option>
              <option value="CAMPUS_FACILITIES">Campus Facilities</option>
              <option value="GENERAL_ADMIN">General Admin</option>
            </select>
          )}

          <button type="submit" className="primary-btn" style={{ width: "100%", marginTop: 10 }}>
            Create Account
          </button>

        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/">Login</Link>
        </div>

      </div>
    </div>
  );
}

export default Signup;
