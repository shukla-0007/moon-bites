import express from "express";
import { MOCK_RESTAURANTS } from "../data/mockRestaurants";

const router = express.Router();

type MoodRequestBody = {
  mood: string; // e.g. "comfort", "healthy", "celebration"
};

const MOOD_TO_TAGS: Record<string, string[]> = {
  comfort: ["comfort", "curry", "biryani"],
  healthy: ["healthy", "light", "salad"],
  celebration: ["party", "celebration", "pizza"],
  workday: ["weekday-lunch", "office"],
};

router.post("/", (req, res) => {
  const { mood } = req.body as MoodRequestBody;

  console.log("[Mood] request body:", req.body);

  const normalizedMood = (mood || "").toLowerCase();
  const moodTags = MOOD_TO_TAGS[normalizedMood] || [];

  if (moodTags.length === 0) {
    return res.json({
      message: "Mood not recognized yet.",
      choice: null,
      reason: `No tag mapping found for mood "${normalizedMood}".`,
      debug: {
        mood: normalizedMood,
        moodTags,
      },
    });
  }

  // Filter restaurants whose tags overlap with moodTags
  const candidates = MOCK_RESTAURANTS.filter((r) =>
    r.tags.some((tag) => moodTags.includes(tag))
  );

  if (candidates.length === 0) {
    return res.json({
      message: "No restaurants match this mood yet.",
      choice: null,
      reason: "Mood tags did not match any restaurant tags.",
      debug: {
        mood: normalizedMood,
        moodTags,
        candidatesCount: candidates.length,
      },
    });
  }

  // Sort by rating (highest) then distance (nearest)
  const sorted = [...candidates].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return a.distanceKm - b.distanceKm;
  });

  const choice = sorted[0];

  return res.json({
    message: "Mood-based recommendation",
    choice,
    reason: `Mapped mood "${normalizedMood}" to tags ${moodTags.join(
      ", "
    )} and picked the highest-rated nearby option.`,
    debug: {
      mood: normalizedMood,
      moodTags,
      candidatesCount: candidates.length,
    },
  });
});

export default router;
