import { useEffect, useState } from "react";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const token = localStorage.getItem("token");

  const filtered = notes.filter((note) => {
    const t = query.toLowerCase();
    return (
      note.title.toLowerCase().includes(t) ||
      (note.transcript_text || "").toLowerCase().includes(t)
    );
  });

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch("http://localhost:4000/recordings", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNotes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 20 }}>Loading notes...</p>;

  return (
    <div className="container" style={{ marginTop: 40, marginBottom: 40 }}>
      <h2 style={{ marginBottom: 16, textAlign: "center" }}>Your Notes</h2>

      {/* Search */}
      <input
        type="text"
        className="mb-2"
        placeholder="Search notes…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* New Recording Button */}
      <button
        onClick={() => (window.location.href = "/new")}
        style={{ marginBottom: 20 }}
      >
        ➕ New Recording
      </button>

      {/* No notes */}
      {notes.length === 0 && (
        <p style={{ textAlign: "center", color: "#555" }}>No notes yet.</p>
      )}

      {/* Notes List */}
      {filtered.map((note) => (
        <div
          key={note.id}
          className="card"
          style={{
            padding: "16px",
            marginBottom: "16px",
            cursor: "pointer",
            transition: "transform 0.12s ease, box-shadow 0.2s ease",
          }}
          onClick={() => (window.location.href = `/note/${note.id}`)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(0.98)";
            e.currentTarget.style.boxShadow =
              "0 6px 18px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0,0,0,0.08)";
          }}
        >
          <h3 style={{ marginBottom: 6 }}>{note.title}</h3>

          <p style={{ margin: 0, color: "#555" }}>
            {(note.transcript_text || "No transcript").slice(0, 60)}…
          </p>

          <small style={{ color: "#888" }}>
            {new Date(note.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  );
}
