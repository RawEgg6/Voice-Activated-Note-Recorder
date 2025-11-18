import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/auth.js";
import { createRecording, getUserRecordings, getRecordingById, updateRecording, deleteRecording, searchRecordings } from "../controllers/recordings.controller.js";

const router = Router();

// Multer config for saving audio locally
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/audio"); // folder path
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// POST /recordings (protected)
router.post("/", authMiddleware, upload.single("audio"), createRecording);

// GET /recordings (protected)
router.get("/", authMiddleware, getUserRecordings);

router.get("/:id", authMiddleware, getRecordingById);

router.patch("/:id", authMiddleware, updateRecording);

router.delete("/:id", authMiddleware, deleteRecording);

router.get("/search", authMiddleware, searchRecordings);
export default router;
