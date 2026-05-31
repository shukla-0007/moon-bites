/**
 * engine/scorer.ts
 * Core scoring function used by all 3 decision flows.
 *
 * Scoring factors (total = 100 points max):
 *   Rating weight    40% — higher rated restaurants score better
 *   Distance weight  20% — closer restaurants score better (0–10 km scale)
 *   Price fit        20% — dish price within budget gets full score
 *   Spice match      20% — dish spice level matches user preference
 */

import { Dish, Restaurant, UserConstraints } from "./types";

export type ScoreResult = {
  score: number;
  reason: string;
};

export function scoreDish(
  dish: Dish,
  restaurant: Restaurant,
  constraints: UserConstraints
): ScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // ── Rating (40%) ───────────────────────────────────────────────────────────
  const ratingScore = (restaurant.rating / 5) * 40;
  score += ratingScore;
  if (restaurant.rating >= 4.5) {
    reasons.push(`top-rated at ${restaurant.rating}★`);
  }

  // ── Distance (20%) — 0 km = 20 pts, 10+ km = 0 pts ───────────────────────
  const distanceScore = Math.max(0, (1 - restaurant.distanceKm / 10)) * 20;
  score += distanceScore;
  if (restaurant.distanceKm <= 2.5) {
    reasons.push("nearby restaurant");
  }

  // ── Price fit (20%) ────────────────────────────────────────────────────────
  if (dish.price <= constraints.budget) {
    score += 20;
    if (dish.price <= constraints.budget * 0.65) {
      reasons.push("great value for budget");
    }
  }

  // ── Spice match (20%) ──────────────────────────────────────────────────────
  if (constraints.spiceLevel !== undefined) {
    const spiceDiff = Math.abs(dish.spiceLevel - constraints.spiceLevel);
    const spiceScore = Math.max(0, (1 - spiceDiff / 2)) * 20;
    score += spiceScore;
    if (spiceDiff === 0) {
      reasons.push("matches your spice preference");
    }
  } else {
    // No spice preference given — neutral bonus
    score += 10;
  }

  const reason =
    reasons.length > 0
      ? reasons.join(", ")
      : `solid pick from ${restaurant.name}`;

  return { score, reason };
}
