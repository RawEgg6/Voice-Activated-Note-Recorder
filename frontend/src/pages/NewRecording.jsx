import { useState, useRef } from "react";

export default function NewRecording() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [language, setLanguage] = useState("en");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Visualizer refs
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const token = localStorage.getItem("token");

  // Draw waveform
  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "#4a90e2";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const startRecording = async () => {
    // Validate title and language before starting
    if (!title.trim()) {
      return alert("Enter a title!");
    }

    try {
      setAudioURL(null);
      audioChunksRef.current = [];

      // Request fresh microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Setup audio context and analyser for visualizer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start visualizer
      setTimeout(() => drawVisualizer(), 100);

      // Pick supported mimetype
      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
      };

      mediaRecorder.start();
      setRecording(true);
      setPaused(false);

    } catch (err) {
      alert("Microphone blocked or unsupported browser.");
      console.error(err);
    }
  };

  const pauseRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "recording") {
      recorder.pause();
      setPaused(true);
    }
  };

  const resumeRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state === "paused") {
      recorder.resume();
      setPaused(false);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;

    if (recorder && (recorder.state === "recording" || recorder.state === "paused")) {
      recorder.stop();
      setRecording(false);
      setPaused(false);

      // Stop mic stream so next recording works
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      // Stop visualizer
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    }
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
        // Upload successful, now show transcribing state
        setTranscribing(true);
        
        // Simulate transcription time (in reality, your backend handles this)
        // You can adjust this or remove if backend redirects immediately
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000); // 2 second delay to show transcribing message
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

        {/* Title and Language - Always visible when not recording */}
        {!recording && (
          <>
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

            <button onClick={startRecording}>🎙 Start Recording</button>
          </>
        )}

        {/* Recording Controls - Show when recording */}
        {recording && (
          <>
            {/* Visualizer Canvas */}
            <canvas
              ref={canvasRef}
              width={540}
              height={120}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
                background: "#f0f0f0",
                border: "2px solid #e0e0e0",
                display: "block",
                marginBottom: 20
              }}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              {!paused ? (
                <button onClick={pauseRecording} style={{ flex: 1 }}>
                  ⏸ Pause
                </button>
              ) : (
                <button onClick={resumeRecording} style={{ flex: 1 }}>
                  ▶ Resume
                </button>
              )}
              
              <button onClick={stopRecording} style={{ flex: 1 }}>
                ⏹ Stop Recording
              </button>
            </div>
          </>
        )}

        {/* Preview and Upload */}
        {audioURL && !recording && (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ marginBottom: 12 }}>Preview</h3>
            <audio controls src={audioURL} style={{ width: "100%" }}></audio>

            <button
              onClick={uploadRecording}
              disabled={uploading || transcribing}
              style={{ marginTop: 20 }}
            >
              {uploading ? "Uploading..." : transcribing ? "Transcribing..." : "Upload Recording"}
            </button>

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

                <p style={{ marginTop: 8, textAlign: "center" }}>
                  Uploading: {progress}%
                </p>
              </div>
            )}

            {transcribing && (
              <div style={{ marginTop: 15 }}>
                <div
                  style={{
                    width: "100%",
                    background: "#eee",
                    borderRadius: 6,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      background: "linear-gradient(90deg, #4caf50 0%, #45a049 50%, #4caf50 100%)",
                      height: 10,
                      animation: "transcribe 2s ease-in-out infinite",
                    }}
                  ></div>
                </div>

                <p style={{ marginTop: 8, textAlign: "center", color: "#4caf50" }}>
                  🎯 Transcribing your audio...
                </p>

                <style>{`
                  @keyframes transcribe {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                  }
                `}</style>
              </div>
            )}

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