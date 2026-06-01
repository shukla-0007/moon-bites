import express from "express";
import cors from "cors";
import path from "path";

import surpriseRouter  from "./routes/surprise";
import moodRouter      from "./routes/mood";
import scheduleRouter  from "./routes/schedule";
import schedulesRouter from "./routes/schedules";
import feedbackRouter  from "./routes/feedback";
import historyRouter   from "./routes/history";

import { startCronWorker } from "./worker/cronWorker";

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Decision Engine API ───────────────────────────────────────────────────
app.use("/api/surprise",  surpriseRouter);
app.use("/api/mood",      moodRouter);
app.use("/api/schedule",  scheduleRouter);   // one-shot plan (Phase 2)

// ── Autonomous Scheduling API (Phase 3) ──────────────────────────────────
app.use("/api/schedules", schedulesRouter);  // save / list / toggle / delete
app.use("/api/feedback",  feedbackRouter);   // post-meal ratings
app.use("/api/history",   historyRouter);    // order history

// ── Static Frontend ───────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "..", "..", "frontend")));

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`\n🌙 Moon Bites backend running on http://localhost:${PORT}`);
  await startCronWorker();
});
