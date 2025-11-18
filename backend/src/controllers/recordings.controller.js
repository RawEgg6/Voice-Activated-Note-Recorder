import {
  saveRecording,
  fetchRecordings,
  fetchRecordingById,
  updateRecordingService,
  deleteRecordingService
} from "../services/recordings.service.js";


export const createRecording = async (req, res) => {
  try {
    const { title, lang } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    console.log("Creating recording with lang:", lang);

    const result = await saveRecording(req.userId, title, req.file.path, lang);

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getUserRecordings = async (req, res) => {
  try {
    const recordings = await fetchRecordings(req.userId);
    res.json(recordings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getRecordingById = async (req, res) => {
  try {
    const id = req.params.id;
    const recording = await fetchRecordingById(id, req.userId);

    if (!recording) {
      return res.status(404).json({ error: "Recording not found" });
    }

    res.json(recording);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRecording = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, transcript_text } = req.body;

    if (!title && !transcript_text) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    const updated = await updateRecordingService(id, req.userId, { title, transcript_text });

    if (!updated) {
      return res.status(404).json({ error: "Recording not found or not yours" });
    }

    res.json({ message: "Recording updated successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRecording = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await deleteRecordingService(id, req.userId);

    if (!deleted) {
      return res.status(404).json({ error: "Recording not found or not yours" });
    }

    return res.json({ message: "Recording deleted successfully" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const searchRecordings = async (req, res) => {
  try {
    const q = req.query.q || "";
    const results = await searchRecordingsService(req.userId, q);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
