import { Router } from "express";

const router = Router();

// Phase 1: placeholder route for "Surprise Me"
router.post("/", (req, res) => {
    console.log("[Surprise] request body:", req.body);
    const constraints = req.body || {};

  res.json({
    message: "Surprise Me placeholder",
    constraints,
    note: "Decision engine will be implemented in Phase 2."
  });
});

export default router; 
