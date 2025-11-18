import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editTitle, setEditTitle] = useState("");
  const [editTranscript, setEditTranscript] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  // Fetch the note
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
      return;
    }

    fetch(`http://localhost:4000/recordings/${id}`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setNote(data);
        setEditTitle(data.title);
        setEditTranscript(data.transcript_text);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text(note.title, 40, 50);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(
      `Created: ${new Date(note.created_at).toLocaleString()}`,
      40,
      80
    );

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("Transcript:", 40, 120);

    const textLines = doc.splitTextToSize(
      note.transcript_text || "",
      520
    );
    doc.setFontSize(12);
    doc.text(textLines, 40, 150);

    const safeTitle = note.title
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "_");

    doc.save(`${safeTitle || "note"}.pdf`);
  };

  const deleteNote = async () => {
    const ok = window.confirm("Are you sure you want to delete this note?");
    if (!ok) return;

    const res = await fetch(`http://localhost:4000/recordings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      alert("Error deleting note");
    }
  };

  const saveChanges = async () => {
    setSaving(true);

    const res = await fetch(`http://localhost:4000/recordings/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        title: editTitle,
        transcript_text: editTranscript,
      }),
    });

    setSaving(false);

    if (res.ok) {
      setNote({
        ...note,
        title: editTitle,
        transcript_text: editTranscript,
      });
      setEditing(false);
    } else {
      alert("Error saving changes");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading note…</p>;
  if (!note) return <p style={{ padding: 20 }}>Note not found</p>;

  return (
    <div className="container" style={{ marginTop: 40, marginBottom: 40 }}>
      {/* Back button */}
      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{ width: "fit-content", marginBottom: 20 }}
      >
        ← Back
      </button>

      <div className="card">
        {/* Title */}
        {editing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ fontSize: 20 }}
          />
        ) : (
          <h2 style={{ marginBottom: 6 }}>{note.title}</h2>
        )}

        <p style={{ color: "#666", marginBottom: 16 }}>
          {new Date(note.created_at).toLocaleString()}
        </p>

        <hr style={{ margin: "20px 0" }} />

        <h3 style={{ marginBottom: 10 }}>Transcript</h3>

        {/* Transcript area */}
        {editing ? (
          <textarea
            value={editTranscript}
            onChange={(e) => setEditTranscript(e.target.value)}
            style={{
              width: "100%",
              height: 260,
              fontSize: 15,
              lineHeight: 1.5,
            }}
          />
        ) : (
          <p
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              borderRadius: 8,
              background: "#fafafa",
              padding: 16,
              color: "#333",
            }}
          >
            {note.transcript_text}
          </p>
        )}

        <hr style={{ margin: "20px 0" }} />

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          {editing ? (
            <button onClick={saveChanges} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          ) : (
            <button onClick={() => setEditing(true)}>Edit</button>
          )}

          <button
            onClick={deleteNote}
            style={{
              background: "#d9534f",
              color: "white",
            }}
          >
            Delete
          </button>

          <button
            onClick={exportPDF}
            style={{
              background: "#4caf50",
              color: "white",
            }}
          >
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
