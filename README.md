# Voice-Activated Note Recorder

A simple web app that lets you record audio notes and automatically converts them to text. Record your thoughts, lectures, or meetings and get instant transcriptions in English, Hindi, or Hinglish.

**Main Features:**
- 🎙️ Record audio with real-time waveform
- 🤖 Automatic speech-to-text transcription
- 🌍 Multi-language support (English, Hindi, Hinglish)
- 📝 Edit, search, and manage your transcripts
- 📄 Export notes as PDF

---

## Table of Contents

- [What You Need](#what-you-need)
- [Installation](#installation)
- [How to Run](#how-to-run)
- [How to Use](#how-to-use)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## What You Need

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download here](https://www.python.org/)
- **A working microphone**
- **4GB RAM minimum** (8GB recommended)

---

## Installation

### Step 1: Clone the Project

```bash
git clone https://github.com/RawEgg6/Voice-Activated-Note-Recorder.git
cd Voice-Activated-Note-Recorder
```

### Step 2: Install Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=4000
JWT_SECRET=your_secret_key_here_make_it_long_and_random
WHISPER_API_URL=http://localhost:5000/transcribe
```

### Step 3: Install Frontend

```bash
cd frontend
npm install
```

### Step 4: Install Transcription Server

```bash
# In the main project folder
pip install flask faster-whisper
```

---

## How to Run

You need to run **three things** in separate terminal windows:

### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```
✅ Backend running at `http://localhost:4000`

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend running at `http://localhost:5173`

### Terminal 3: Start Transcription Server
```bash
python whisper_server.py
```
✅ Whisper server running at `http://localhost:5000`

**Then open your browser and go to:** `http://localhost:5173`

---

## How to Use

### 1. Create an Account
- Go to `http://localhost:5173`
- Click "Sign Up"
- Enter email and password
- Log in

### 2. Record a Note
- Click "New Recording" button
- Enter a title for your note
- Choose language (English/Hindi/Hinglish)
- Click "🎙 Start Recording"
- Allow microphone access if prompted
- Speak clearly - you'll see the waveform moving
- Click "⏹ Stop Recording" when done

### 3. Upload and Transcribe
- Listen to your recording
- Click "Upload Recording"
- Wait for it to transcribe (takes a few seconds)
- Your note appears in the dashboard with the transcript

### 4. Manage Your Notes
- View all recordings in the dashboard
- Click any note to see full transcript
- Edit the title or transcript text
- Search through your notes
- Download as PDF
- Delete notes you don't need

---

## Troubleshooting

### "Microphone blocked" error
- Check your browser settings and allow microphone access
- Go to `chrome://settings/content/microphone` (Chrome)
- Make sure the site is allowed to use the microphone

### Transcription takes forever or fails
- Make sure the Whisper server is running (`python whisper_server.py`)
- First time running downloads a ~500MB model (one-time)
- Check all three terminals are running without errors

### Can't log in or sign up
- Make sure backend is running (`npm run dev` in backend folder)
- Check if `.env` file exists with `JWT_SECRET`

### Upload fails
- Create folder: `backend/uploads/audio/` if it doesn't exist
- Make sure you have disk space

### No audio in recording
- Test your microphone in system settings
- Try a different browser (Chrome works best)
- Make sure correct microphone is selected in system sound settings

---

## FAQ

**Q: Where are my recordings saved?**  
A: Audio files are in `backend/uploads/audio/` and transcripts are in `backend/database.sqlite`

**Q: Is my data private?**  
A: Yes! Everything runs locally on your computer. Nothing is sent to the internet.

**Q: Can I use this offline?**  
A: Yes, after the first run downloads the Whisper model.

**Q: What languages are supported?**  
A: English, Hindi (Devanagari script), and Hinglish (Hindi in English letters)

**Q: How accurate is the transcription?**  
A: Pretty good for clear audio! About 90-95% accurate for English. Background noise reduces accuracy.

**Q: Can I change the transcription quality?**  
A: Yes! Edit `whisper_server.py` and change `"small"` to:
- `"tiny"` - Fastest, less accurate
- `"base"` - Fast, decent
- `"small"` - Balanced (default)
- `"medium"` - Slow, better
- `"large-v2"` - Slowest, best

**Q: How do I stop the servers?**  
A: Press `Ctrl + C` in each terminal window

---

## License

MIT License - free to use and modify!

---

## Need Help?

If something doesn't work:
1. Check all three servers are running (backend, frontend, whisper)
2. Look at the terminal for error messages
3. Make sure your microphone works in other apps
4. Try restarting everything

**Enjoy recording your notes! 🎤📝**
