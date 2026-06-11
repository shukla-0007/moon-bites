/**
 * routes/schedule.ts  (Phase 4)
 * Thin route wrapper: validates input → calls scheduleEngine (async) → responds.
 */

import express from "express";
import { runSchedule } from "../engine/scheduleEngine";
import { ScheduleInput } from "../engine/types";
import { SwiggyMcpError } from "../integration/swiggyMcp";

const router = express.Router();

type ScheduleRequestBody = {
  time: string;
  days: string[];
  budget: number;
  veg: boolean;
};

router.post("/", async (req, res, next) => {
  try {
    const { time, days, budget, veg } = req.body as ScheduleRequestBody;
    console.log("[Schedule] request body:", req.body);

    if (!time || !days || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({
        message: "Please provide a valid time and select at least one day.",
        schedule: [],
      });
    }

    // 1. Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return res.status(400).json({
        message: "Invalid time format. Must be HH:MM in 24-hour format.",
        schedule: [],
      });
    }

    // 2. Validate days content
    const validDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const hasInvalidDay = days.some(d => !validDays.includes(d));
    if (hasInvalidDay) {
      return res.status(400).json({
        message: "Invalid days specified. Allowed days: Sun, Mon, Tue, Wed, Thu, Fri, Sat.",
        schedule: [],
      });
    }

    // 3. Validate budget
    const budgetNum = Number(budget);
    if (isNaN(budgetNum) || budgetNum < 50 || budgetNum > 5000) {
      return res.status(400).json({
        message: "Budget must be a number between 50 and 5000.",
        schedule: [],
      });
    }

    const input: ScheduleInput = { time, days, budget: budgetNum, veg: Boolean(veg) };
    const schedule = await runSchedule(input);

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
  } catch (err) {
    if (err instanceof SwiggyMcpError) {
      console.warn(`[Schedule API] Swiggy MCP error: [${err.code}] ${err.message}`);
      return res.status(500).json({
        error: err.message,
        code: err.code,
        message: "Failed to generate schedule due to a Swiggy MCP communication issue.",
      });
    }
    next(err);
  }
});

export default router;
