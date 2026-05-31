import express from "express";
import { MOCK_RESTAURANTS } from "../data/mockRestaurants";

const router = express.Router();

type ScheduleRequestBody = {
  time: string; // "13:00"
  days: string[]; // ["Mon", "Tue"]
};

function getTimeOfDay(time: string): "lunch" | "dinner" | "other" {
  const [hStr] = time.split(":");
  const hour = Number(hStr);

  if (hour >= 11 && hour <= 15) return "lunch";
  if (hour >= 18 && hour <= 22) return "dinner";
  return "other";
}

router.post("/", (req, res) => {
  const { time, days } = req.body as ScheduleRequestBody;

  console.log("[Schedule] request body:", req.body);

  const timeOfDay = getTimeOfDay(time);

  let preferredTags: string[];

  if (timeOfDay === "lunch") {
    preferredTags = ["weekday-lunch", "light", "office", "healthy"];
  } else if (timeOfDay === "dinner") {
    preferredTags = ["comfort", "party", "celebration"];
  } else {
    preferredTags = ["comfort"];
  }

  // Filter once for this time-of-day preference
  const candidates = MOCK_RESTAURANTS.filter((r) =>
    r.tags.some((tag) => preferredTags.includes(tag))
  );

  if (candidates.length === 0) {
    return res.json({
      message: "No schedule plan available yet.",
      schedule: [],
      reason: "No restaurants matched the time-of-day preferences.",
      debug: {
        time,
        days,
        timeOfDay,
        preferredTags,
        candidatesCount: candidates.length,
      },
    });
  }

  // Sort candidates by rating then distance
  const sorted = [...candidates].sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return a.distanceKm - b.distanceKm;
  });

  // Build a plan: cycle through sorted list for each day
  const schedule = (days || []).map((day, index) => {
    const choice = sorted[index % sorted.length];
    return {
      day,
      time,
      choice,
    };
  });

  return res.json({
    message: "Simple recurring schedule",
    schedule,
    reason: `Built a recurring ${timeOfDay} plan using tags ${preferredTags.join(
      ", "
    )} and cycling through candidates for variety.`,
    debug: {
      time,
      days,
      timeOfDay,
      preferredTags,
      candidatesCount: candidates.length,
    },
  });
});

export default router;
