import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.get("/me", authMiddleware, (req, res) => {
  res.json({ message: "You are logged in", userId: req.userId });
});

export default router;
