import express from "express";
import { MOCK_RESTAURANTS } from "../data/mockRestaurants";

const router = express.Router();

type SurpriseRequestBody = {
  budget: number;
  veg: boolean;
};

router.post("/", (req, res) => {
  const { budget, veg } = req.body as SurpriseRequestBody;

  console.log("[Surprise] request body:", req.body);

  // 1) Filter by budget
  const budgetFiltered = MOCK_RESTAURANTS.filter(
    (r) => r.avgPriceForTwo <= budget
  );

  // 2) Filter by veg flag
  const vegFiltered = veg
    ? budgetFiltered.filter((r) => r.vegOnly)
    : budgetFiltered;

  // 3) If nothing left, fall back to a simple message
  if (vegFiltered.length === 0) {
    return res.json({
      message: "No restaurants match your criteria yet.",
      choice: null,
      reason: "Budget and veg filters removed all options.",
      debug: {
        budget,
        veg,
        candidatesCountAfterBudget: budgetFiltered.length,
        candidatesCountAfterVeg: vegFiltered.length,
      },
    });
  }

  // 4) Sort by rating (highest first)
  const sorted = [...vegFiltered].sort((a, b) => b.rating - a.rating);

  // 5) Take top 3 and pick a random one among them (surprise)
  const topN = sorted.slice(0, 3);
  const randomIndex = Math.floor(Math.random() * topN.length);
  const choice = topN[randomIndex];

  return res.json({
    message: "Surprise Me recommendation",
    choice,
    reason:
      "Picked a highly-rated option within your budget and veg preference, then added surprise by choosing randomly among the top few.",
    debug: {
      budget,
      veg,
      candidatesCountAfterBudget: budgetFiltered.length,
      candidatesCountAfterVeg: vegFiltered.length,
      finalPoolSize: topN.length,
    },
  });
});

export default router;
