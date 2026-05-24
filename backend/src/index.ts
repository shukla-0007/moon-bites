import express from "express";
import cors from "cors";
import path from "path";

import surpriseRouter from "./routes/surprise";
import moodRouter from "./routes/mood";
import scheduleRouter from "./routes/schedule";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api/surprise", surpriseRouter);
app.use("/api/mood", moodRouter);
app.use("/api/schedule", scheduleRouter);

// Static frontend
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

app.listen(PORT, () => {
  console.log(`Moon Bites backend listening on port ${PORT}`);
}); 



