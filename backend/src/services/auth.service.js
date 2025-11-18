import db from "../db/database.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

export const signupUser = async (email, password) => {
  const existing = await db.get(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (existing) {
    throw new Error("Email already in use");
  }

  const password_hash = await hashPassword(password);

  const result = await db.run(
    "INSERT INTO users (email, password_hash) VALUES (?, ?)",
    [email, password_hash]
  );

  const userId = result.lastID;

  const token = signToken({ userId });

  return {
    token,
    user: { id: userId, email }
  };
};



export const loginUser = async (email, password) => {
  const user = await db.get(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  if (!user) {
    throw new Error("User not found");
  }

  const valid = await comparePassword(password, user.password_hash);

  if (!valid) {
    throw new Error("Invalid password");
  }

  const token = signToken({ userId: user.id });

  return {
    token,
    user: { id: user.id, email: user.email }
  };
};

