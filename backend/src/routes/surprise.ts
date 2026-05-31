/**
 * routes/surprise.ts  (Phase 2)
 * Thin route wrapper: validates input → calls surpriseEngine → saves to DB → responds.
 */

import express from "express";
import { runSurprise } from "../engine/surpriseEngine";
import { UserConstraints, SpiceLevel } from "../engine/types";
import prisma from "../lib/prisma";

const router = express.Router();

type SurpriseRequestBody = {
  budget: number;
  veg: boolean;
  spiceLevel?: SpiceLevel;
};

router.post("/", async (req, res) => {
  const { budget, veg, spiceLevel } = req.body as SurpriseRequestBody;
  console.log("[Surprise] request body:", req.body);

  const constraints: UserConstraints = { budget, veg, spiceLevel };
  const result = runSurprise(constraints);

  if (!result) {
    return res.json({
      message: "No restaurants match your criteria. Try loosening your filters.",
      pick: null,
      alternatives: [],
      saved: false,
    });
  }

  // Save to OrderHistory (userId null — auth comes in Phase 6)
  let saved = false;
  try {
    await prisma.orderHistory.create({
      data: {
        flow: "surprise",
        restaurantId: result.pick.restaurant.id,
        restaurantName: result.pick.restaurant.name,
        dishName: result.pick.dish.name,
        dishPrice: result.pick.dish.price,
        constraints: JSON.stringify(constraints),
      },
    });
    saved = true;
  } catch (err) {
    console.error("[Surprise] DB save failed:", err);
  }

  return res.json({
    message: "Surprise Me recommendation",
    pick: result.pick,
    alternatives: result.alternatives,
    saved,
  });
});

export default router;
