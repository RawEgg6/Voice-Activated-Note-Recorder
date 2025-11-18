import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = verifyToken(token);

    req.userId = decoded.userId; // attach user ID for the route to use

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
