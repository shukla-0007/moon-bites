/**
 * routes/schedules.ts
 * CRUD for saved meal schedules.
 *
 * POST   /api/schedules          — save a new schedule
 * GET    /api/schedules          — list all saved schedules
 * PATCH  /api/schedules/:id      — toggle active on/off
 * DELETE /api/schedules/:id      — delete a schedule
 */

import express from "express";
import prisma from "../lib/prisma";
import { registerSchedule, unregisterSchedule } from "../worker/cronWorker";

const router = express.Router();

// POST /api/schedules — save a new schedule
router.post("/", async (req, res) => {
  const { label, time, days, budget, veg } = req.body;
  console.log("[Schedules] save:", req.body);

  if (!time || !days || !Array.isArray(days) || days.length === 0) {
    return res.status(400).json({ message: "time and days[] are required." });
  }

  try {
    const schedule = await prisma.schedule.create({
      data: {
        label: label || "My Meal Plan",
        time,
        days: days.join(","),
        budget: Number(budget) || 300,
        veg: Boolean(veg),
        active: true,
      },
    });

    // Register cron job immediately
    registerSchedule(schedule);

    return res.json({ message: "Schedule saved and activated.", schedule });
  } catch (err) {
    console.error("[Schedules] save error:", err);
    return res.status(500).json({ message: "Failed to save schedule." });
  }
});

// GET /api/schedules — list all schedules
router.get("/", async (_req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json({ schedules });
  } catch (err) {
    console.error("[Schedules] list error:", err);
    return res.status(500).json({ message: "Failed to fetch schedules." });
  }
});

// PATCH /api/schedules/:id — toggle active
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { active } = req.body;

  try {
    const updated = await prisma.schedule.update({
      where: { id },
      data: { active: Boolean(active) },
    });

    if (updated.active) {
      registerSchedule(updated);
    } else {
      unregisterSchedule(updated.id);
    }

    return res.json({ message: `Schedule ${updated.active ? "activated" : "paused"}.`, schedule: updated });
  } catch (err) {
    console.error("[Schedules] toggle error:", err);
    return res.status(500).json({ message: "Failed to update schedule." });
  }
});

// DELETE /api/schedules/:id — remove schedule
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.schedule.delete({ where: { id } });
    unregisterSchedule(id);
    return res.json({ message: "Schedule deleted." });
  } catch (err) {
    console.error("[Schedules] delete error:", err);
    return res.status(500).json({ message: "Failed to delete schedule." });
  }
});

export default router;
