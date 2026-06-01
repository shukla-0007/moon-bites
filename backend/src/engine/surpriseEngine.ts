/**
 * engine/surpriseEngine.ts
 * Handles the "Surprise Me" flow.
 *
 * Algorithm:
 *  1. Fetch restaurants via MCP discoverRestaurants
 *  2. Fetch menus via MCP getRestaurantMenu
 *  3. Filter: veg, budget, blacklisted tags
 *  4. Score each passing dish with scorer.ts
 *  5. Add ±5% random jitter to score for surprise (re-runs give different results)
 *  6. Sort by final score — return top pick + next 2 as alternatives
 */

import { swiggyMcpClient } from "../integration/swiggyMcp";
import { UserConstraints, DishRecommendation, SurpriseResult } from "./types";
import { scoreDish } from "./scorer";

export async function runSurprise(constraints: UserConstraints): Promise<SurpriseResult | null> {
  const candidates: DishRecommendation[] = [];

  // Call discovery tool (placeholder coords for Bangalore)
  let restaurants;
  try {
    restaurants = await swiggyMcpClient.discoverRestaurants(12.9716, 77.5946);
  } catch (err) {
    console.error("[surpriseEngine] discoverRestaurants failed:", err);
    throw err; // propagate up so routes/workers can handle errors robustly
  }

  for (const restaurant of restaurants) {
    // Skip blacklisted restaurants
    if (constraints.blacklistedTags && constraints.blacklistedTags.length > 0) {
      const hasBlacklisted = restaurant.tags.some((t) =>
        constraints.blacklistedTags!.includes(t)
      );
      if (hasBlacklisted) continue;
    }

    // Call menu tool
    let dishes;
    try {
      dishes = await swiggyMcpClient.getRestaurantMenu(restaurant.id);
    } catch (err) {
      // Log warning and skip this restaurant menu to keep recommendation engine going
      console.warn(`[surpriseEngine] Failed to get menu for ${restaurant.name} (${restaurant.id}):`, err);
      continue;
    }

    for (const dish of dishes) {
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
