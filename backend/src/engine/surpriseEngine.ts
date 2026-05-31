/**
 * engine/surpriseEngine.ts
 * Handles the "Surprise Me" flow.
 *
 * Algorithm:
 *  1. Flatten all restaurants → dishes
 *  2. Filter: veg, budget, blacklisted tags
 *  3. Score each passing dish with scorer.ts
 *  4. Add ±5% random jitter to score for surprise (re-runs give different results)
 *  5. Sort by final score — return top pick + next 2 as alternatives
 */

import { MOCK_RESTAURANTS } from "../data/mockRestaurants";
import { UserConstraints, DishRecommendation, SurpriseResult } from "./types";
import { scoreDish } from "./scorer";

export function runSurprise(constraints: UserConstraints): SurpriseResult | null {
  const candidates: DishRecommendation[] = [];

  for (const restaurant of MOCK_RESTAURANTS) {
    // Skip blacklisted restaurants
    if (constraints.blacklistedTags && constraints.blacklistedTags.length > 0) {
      const hasBlacklisted = restaurant.tags.some((t) =>
        constraints.blacklistedTags!.includes(t)
      );
      if (hasBlacklisted) continue;
    }

    for (const dish of restaurant.dishes) {
      // Veg filter at dish level
      if (constraints.veg && !dish.isVeg) continue;

      // Budget filter
      if (dish.price > constraints.budget) continue;

      const { score, reason } = scoreDish(dish, restaurant, constraints);

      // ±5% random jitter for the "surprise" randomness
      const jitter = (Math.random() - 0.5) * 0.1 * score;
      const finalScore = Math.max(0, score + jitter);

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
        score: Math.round(finalScore * 10) / 10,
        reason,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);

  return {
    pick: candidates[0],
    alternatives: candidates.slice(1, 3),
  };
}
