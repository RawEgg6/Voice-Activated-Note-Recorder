from flask import Flask, request, jsonify
from faster_whisper import WhisperModel
import os
import tempfile

app = Flask(__name__)

# Load Whisper model
model = WhisperModel("small", device="cpu", compute_type="int8")

@app.route("/transcribe", methods=["POST"])
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file"}), 400

    audio_file = request.files["audio"]
    lang = request.form.get("lang", "en")  # en, hi, hinglish

    print(f"Received transcription request: lang={lang}, filename={audio_file.filename}")
    print("*"* 50)
    # Convert frontend option to Whisper options
    if lang == "en":
        whisper_language = "en"
        whisper_task = "transcribe"
    elif lang == "hi":
        whisper_language = "hi"
        whisper_task = "transcribe"
    elif lang == "hinglish":
        whisper_language = "hi"
        whisper_task = "translate"   # Hindi → Romanized English
    else:
        whisper_language = None
        whisper_task = "transcribe"

    # Save temporary audio
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        audio_path = tmp.name
        audio_file.save(audio_path)

    # Run Whisper
    segments, info = model.transcribe(
        audio_path,
        language=whisper_language,
        task=whisper_task
    )

    text = " ".join([s.text for s in segments])

    # Clean temp audio file
    os.remove(audio_path)

    return jsonify({
        "text": text,
        "detected_language": info.language,
        "mode": lang
    })

if __name__ == "__main__":
    app.run(port=5000)
