import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("http://localhost:4000/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setLoading(false);

    if (res.ok) {
      setDone(true);
      setTimeout(() => navigate("/login"), 1200);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Set New Password
        </h2>

        {done ? (
          <p style={{ textAlign: "center", color: "#333" }}>
            Password updated successfully. Redirecting to login…
          </p>
        ) : (
          <form onSubmit={submit}>
            <div className="mb-2">
              <label>New Password</label>
              <input
                type="password"
                placeholder="Enter a new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit">
              {loading ? "Saving..." : "Save Password"}
            </button>
          </form>
        )}

        {!done && (
          <p style={{ marginTop: "15px", textAlign: "center" }}>
            <a href="/login">Back to Login</a>
          </p>
        )}
      </div>
    </div>
  );
}
