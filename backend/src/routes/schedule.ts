/**
 * routes/schedule.ts  (Phase 2)
 * Thin route wrapper: validates input → calls scheduleEngine → responds.
 */

import express from "express";
import { runSchedule } from "../engine/scheduleEngine";
import { ScheduleInput } from "../engine/types";

const router = express.Router();

type ScheduleRequestBody = {
  time: string;
  days: string[];
  budget: number;
  veg: boolean;
};

router.post("/", (req, res) => {
  const { time, days, budget, veg } = req.body as ScheduleRequestBody;
  console.log("[Schedule] request body:", req.body);

  if (!days || days.length === 0) {
    return res.json({
      message: "Please select at least one day.",
      schedule: [],
    });
  }

  const input: ScheduleInput = { time, days, budget, veg };
  const schedule = runSchedule(input);

  if (schedule.length === 0) {
    return res.json({
      message: "No meals could be planned with these constraints. Try increasing budget or allowing non-veg.",
      schedule: [],
    });
  }

  return res.json({
    message: "Your week plan is ready",
    schedule,
  });
});

export default router;
