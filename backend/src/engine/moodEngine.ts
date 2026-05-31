/**
 * engine/moodEngine.ts
 * Handles the "Mood-Based" flow.
 *
 * Each mood maps to:
 *   - tags: dish/restaurant tags to match on
 *   - spicePreference: default spice level for this mood
 *   - budgetMultiplier: adjusts a base budget of ₹500 for the mood
 *
 * Returns top 5 matches sorted by score (highest first).
 */

import { MOCK_RESTAURANTS } from "../data/mockRestaurants";
import { MoodInput, DishRecommendation, SpiceLevel } from "./types";
import { scoreDish } from "./scorer";

type MoodConfig = {
  tags: string[];
  spicePreference: SpiceLevel;
  budgetMultiplier: number;
  label: string;
};

export const MOOD_MAP: Record<string, MoodConfig> = {
  comfort: {
    tags: ["comfort", "curry", "biryani", "cozy"],
    spicePreference: 2,
    budgetMultiplier: 1.0,
    label: "Comfort Food",
  },
  healthy: {
    tags: ["healthy", "light", "salad", "fresh"],
    spicePreference: 1,
    budgetMultiplier: 1.0,
    label: "Healthy",
  },
  celebration: {
    tags: ["celebration", "party", "pizza", "indulgent"],
    spicePreference: 2,
    budgetMultiplier: 1.2,
    label: "Celebration",
  },
  workday: {
    tags: ["weekday-lunch", "office", "light", "quick"],
    spicePreference: 1,
    budgetMultiplier: 0.7,
    label: "Workday Lunch",
  },
  "cheat-meal": {
    tags: ["cheat-meal", "pizza", "burger", "indulgent"],
    spicePreference: 2,
    budgetMultiplier: 1.1,
    label: "Cheat Meal",
  },
  "high-protein": {
    tags: ["high-protein", "protein", "fitness", "gym"],
    spicePreference: 1,
    budgetMultiplier: 1.0,
    label: "High Protein",
  },
};

const BASE_BUDGET = 500;

export function runMood(input: MoodInput): DishRecommendation[] {
  const config = MOOD_MAP[input.mood.toLowerCase()];
  if (!config) return [];

  const effectiveBudget = BASE_BUDGET * config.budgetMultiplier;
  const candidates: DishRecommendation[] = [];

  for (const restaurant of MOCK_RESTAURANTS) {
    // Restaurant must have at least one matching mood tag
    const restaurantTagMatch = restaurant.tags.some((t) =>
      config.tags.includes(t)
    );

    for (const dish of restaurant.dishes) {
      // Dish must have at least one matching mood tag OR restaurant has a match
      const dishTagMatch = dish.tags.some((t) => config.tags.includes(t));
      if (!restaurantTagMatch && !dishTagMatch) continue;

      // Budget filter
      if (dish.price > effectiveBudget) continue;

      const { score, reason } = scoreDish(dish, restaurant, {
        budget: effectiveBudget,
        veg: false, // mood flow is veg-agnostic; filter can be added later
        spiceLevel: config.spicePreference,
      });

      // Tag match bonus: reward dishes that directly match mood tags
      const tagBonus = dishTagMatch ? 5 : 0;

      candidates.push({
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          rating: restaurant.rating,
          distanceKm: restaurant.distanceKm,
          vegOnly: restaurant.vegOnly,
        },
        dish,
        score: Math.round((score + tagBonus) * 10) / 10,
        reason: `${reason} — perfect for a ${config.label} vibe`,
      });
    }
  }

  // Sort by score descending, return top 5
  return candidates.sort((a, b) => b.score - a.score).slice(0, 5);
}
