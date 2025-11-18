import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import recordingsRoutes from "./routes/recordings.routes.js";

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/test", testRoutes);
app.use("/recordings", recordingsRoutes);

export default app;
