import db from "../db/database.js";
import { transcribeAudio } from "./whisper.service.js";

export const saveRecording = async (userId, title, audioPath, lang) => {
  const transcript = await transcribeAudio(audioPath, lang);

  const result = await db.run(
    "INSERT INTO recordings (user_id, title, audio_path, transcript_text) VALUES (?, ?, ?, ?)",
    [userId, title, audioPath, transcript]
  );

  const id = result.lastID;

  return {
    id,
    title,
    audio_path: audioPath,
    transcript_text: transcript
  };
};

export const fetchRecordings = async (userId) => {
  const rows = await db.all(
    "SELECT id, title, audio_path, transcript_text, created_at FROM recordings WHERE user_id = ? ORDER BY created_at DESC",
    [userId]
  );

  return rows;
};

export const fetchRecordingById = async (id, userId) => {
  const row = await db.get(
    "SELECT id, title, audio_path, transcript_text, created_at FROM recordings WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  return row; // may be null if not found
};

export const updateRecordingService = async (id, userId, { title, transcript_text }) => {
  const fields = [];
  const values = [];

  if (title) {
    fields.push("title = ?");
    values.push(title);
  }

  if (transcript_text) {
    fields.push("transcript_text = ?");
    values.push(transcript_text);
  }

  // update timestamp
  fields.push("updated_at = CURRENT_TIMESTAMP");

  values.push(id, userId);

  const result = await db.run(
    `UPDATE recordings SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    values
  );

  return result.changes > 0;
};

import fs from "fs";

export const deleteRecordingService = async (id, userId) => {
  // First get the audio path so we can delete the file
  const recording = await db.get(
    "SELECT audio_path FROM recordings WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  if (!recording) return false;

  // Remove file from disk
  try {
    fs.unlinkSync(recording.audio_path);
  } catch (err) {
    console.warn("File not found, but DB entry will still be deleted.");
  }

  // Delete DB row
  const result = await db.run(
    "DELETE FROM recordings WHERE id = ? AND user_id = ?",
    [id, userId]
  );

  return result.changes > 0;
};

export const searchRecordingsService = async (userId, q) => {
  const like = `%${q}%`;

  const rows = await db.all(
    `SELECT id, title, transcript_text, audio_path, created_at
     FROM recordings
     WHERE user_id = ?
     AND (title LIKE ? OR transcript_text LIKE ?)
     ORDER BY created_at DESC`,
    [userId, like, like]
  );

  return rows;
};
