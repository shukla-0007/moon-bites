import { Router } from "express";

const router = Router();

// Phase 1: placeholder route for scheduling
router.post("/", (req, res) => {
    console.log("[Schedule] request body:", req.body); 
    const schedule = req.body || {};

  res.json({
    message: "Schedule placeholder",
    schedule,
    note: "Scheduling & cron jobs will be implemented in Phase 3."
  });
});

export default router; 
