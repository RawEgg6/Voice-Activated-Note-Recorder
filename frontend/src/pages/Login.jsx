import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      setMessage(data.error || "Invalid login");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Login</h2>

        <form onSubmit={handleLogin}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Login</button>
        </form>

        {message && (
          <p style={{ marginTop: "12px", textAlign: "center", color: "#d00" }}>
            {message}
          </p>
        )}

        <p style={{ marginTop: "15px", textAlign: "center" }}>
          <a href="/forgot-password">Forgot Password?</a>
        </p>

        <p style={{ marginTop: "10px", textAlign: "center" }}>
          New here? <a href="/signup">Create account</a>
        </p>
      </div>
    </div>
  );
}
