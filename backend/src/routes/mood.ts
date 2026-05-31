/**
 * routes/mood.ts  (Phase 2)
 * Thin route wrapper: validates mood input → calls moodEngine → responds.
 */

import express from "express";
import { runMood, MOOD_MAP } from "../engine/moodEngine";

const router = express.Router();

type MoodRequestBody = {
  mood: string;
};

router.post("/", (req, res) => {
  const { mood } = req.body as MoodRequestBody;
  console.log("[Mood] request body:", req.body);

  const normalizedMood = (mood || "").toLowerCase().trim();

  if (!MOOD_MAP[normalizedMood]) {
    return res.json({
      message: `Mood "${normalizedMood}" is not recognized.`,
      mood: normalizedMood,
      results: [],
      availableMoods: Object.keys(MOOD_MAP),
    });
  }

  const results = runMood({ mood: normalizedMood });

  return res.json({
    message: "Mood-based recommendations",
    mood: normalizedMood,
    results,
  });
});

export default router;
