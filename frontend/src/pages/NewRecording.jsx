import { useState, useRef } from "react";

export default function NewRecording() {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const token = localStorage.getItem("token");

  const startRecording = async () => {
    setAudioURL(null);
    audioChunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  };

  const uploadRecording = () => {
    if (!audioURL) return alert("Record something first!");
    if (!title.trim()) return alert("Enter a title!");

    setUploading(true);
    setError(null);
    setProgress(0);

    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    formData.append("title", title);
    formData.append("lang", language);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4000/recordings");
    xhr.setRequestHeader("Authorization", "Bearer " + token);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      setUploading(false);

      if (xhr.status >= 200 && xhr.status < 300) {
        window.location.href = "/dashboard";
      } else {
        setError("Upload failed. Server error.");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      setError("Network error while uploading.");
    };

    xhr.send(formData);
  };

  if (!token) {
    window.location.href = "/login";
    return;
  }

  return (
    <div className="container" style={{ marginTop: 40 }}>
      {/* Back Button */}
      <button
        onClick={() => (window.location.href = "/dashboard")}
        style={{ width: "fit-content", marginBottom: 20 }}
      >
        ← Back
      </button>

      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          New Recording
        </h2>

        {/* Title Field */}
        <div className="mb-2">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Recording Controls */}
        {!recording && (
          <button onClick={startRecording}>🎙 Start Recording</button>
        )}

        {recording && (
          <>
            <div className="mb-2">
              <label>Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                required
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="hinglish">Hinglish (Roman Hindi)</option>
              </select>
            </div>

            <button onClick={stopRecording}>⏹ Stop Recording</button>
          </>
        )}

        {/* Preview */}
        {audioURL && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Preview</h3>
            <audio controls src={audioURL} style={{ width: "100%" }}></audio>

            <button
              onClick={uploadRecording}
              disabled={uploading}
              style={{ marginTop: 20 }}
            >
              {uploading ? "Uploading..." : "Upload Recording"}
            </button>

            {/* Progress Bar */}
            {uploading && (
              <div style={{ marginTop: 15 }}>
                <div
                  style={{
                    width: "100%",
                    background: "#eee",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: progress + "%",
                      background: "#4caf50",
                      height: 10,
                      transition: "width 0.15s",
                    }}
                  ></div>
                </div>

                <p style={{ marginTop: 8, textAlign: "center" }}>{progress}%</p>
              </div>
            )}

            {/* Error */}
            {error && (
              <p style={{ marginTop: 15, color: "red", textAlign: "center" }}>
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
