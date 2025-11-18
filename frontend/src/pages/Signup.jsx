import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      setMessage("Signup successful! Redirecting...");
      setTimeout(() => navigate("/login"), 800);
    } else {
      setMessage(data.error || "Error signing up");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Create Account</h2>

        <form onSubmit={handleSignup}>
          <div className="mb-2">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-2">
            <label>Password</label>
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Signup</button>
        </form>

        {message && (
          <p style={{ marginTop: "12px", textAlign: "center", color: "#444" }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
