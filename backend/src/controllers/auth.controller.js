import { signupUser, loginUser } from "../services/auth.service.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import db from "../db/database.js";

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await signupUser(email, password);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
  if (!user) return res.json({ message: "If account exists, email is sent." }); 

  const token = jwt.sign(
    { id: user.id },
    process.env.RESET_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link expires in 15 minutes.</p>
    `
  });

  res.json({ message: "Reset email sent" });
};

// 2️⃣ Reset password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  console.log("----- RESET PASSWORD START -----");
  console.log("Incoming token:", token ? token.slice(0, 30) + "..." : "NONE");
  console.log("Token length:", token ? token.length : "NO TOKEN");
  console.log("Incoming password:", password ? "[PROVIDED]" : "EMPTY");
  console.log("Reset secret present:", !!process.env.RESET_TOKEN_SECRET);

  if (!token) {
    console.log("ERROR: No token provided");
    return res.status(400).json({ error: "Missing token" });
  }

  if (!password || password.trim().length === 0) {
    console.log("ERROR: No password provided");
    return res.status(400).json({ error: "Password is required" });
  }

  let decoded;

  try {
    console.log("Attempting to verify token...");
    decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    console.log("Token verified successfully:", decoded);
  } catch (err) {
    console.log("JWT ERROR NAME:", err.name);
    console.log("JWT ERROR MESSAGE:", err.message);
    console.log("----- RESET PASSWORD END (FAIL) -----");
    return res.status(400).json({
      error: "Invalid or expired token",
      details: err.message
    });
  }

  try {
    console.log("Hashing new password...");
    const hashed = await bcrypt.hash(password, 10);

    console.log("Updating password in DB for user ID:", decoded.id);
    await db.run(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hashed, decoded.id]
    );

    console.log("Password updated successfully.");
    console.log("----- RESET PASSWORD END (SUCCESS) -----");

    return res.json({ message: "Password reset successful" });

  } catch (err) {
    console.log("DB ERROR:", err.message);
    console.log("----- RESET PASSWORD END (FAIL) -----");
    return res.status(500).json({ error: "Database update failed" });
  }
};
