import { Router } from "express";

const router = Router();

// Phase 1: placeholder route for mood-based suggestions
router.post("/", (req, res) => {
    console.log("[Mood] request body:", req.body);
    const mood = req.body?.mood || "unknown"; 

  res.json({
    message: "Mood-based placeholder",
    mood,
    note: "Mood decision logic will be implemented in Phase 2."
  });
});

export default router; 
