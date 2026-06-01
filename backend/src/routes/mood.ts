/**
 * routes/mood.ts  (Phase 4)
 * Thin route wrapper: validates mood input → calls moodEngine (async) → responds.
 */

import express from "express";
import { runMood, MOOD_MAP } from "../engine/moodEngine";
import { SwiggyMcpError } from "../integration/swiggyMcp";

const router = express.Router();

type MoodRequestBody = {
  mood: string;
};

router.post("/", async (req, res, next) => {
  try {
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

    const results = await runMood({ mood: normalizedMood });

    return res.json({
      message: "Mood-based recommendations",
      mood: normalizedMood,
      results,
    });
  } catch (err) {
    if (err instanceof SwiggyMcpError) {
      console.warn(`[Mood API] Swiggy MCP error: [${err.code}] ${err.message}`);
      return res.status(500).json({
        error: err.message,
        code: err.code,
        message: "Failed to fetch Swiggy restaurants or menus for this mood.",
      });
    }
    next(err);
  }
});

export default router;
