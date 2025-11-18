import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    await fetch("http://localhost:4000/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="auth-wrapper">
      <div className="card" style={{ width: "100%", maxWidth: 380 }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Reset Password
        </h2>

        {sent ? (
          <p style={{ textAlign: "center", color: "#333" }}>
            Check your email for a reset link.
          </p>
        ) : (
          <form onSubmit={submit}>
            <div className="mb-2">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter your account email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {!sent && (
          <p style={{ marginTop: "15px", textAlign: "center" }}>
            <a href="/login">Back to Login</a>
          </p>
        )}
      </div>
    </div>
  );
}
