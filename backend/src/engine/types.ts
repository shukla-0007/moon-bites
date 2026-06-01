/**
 * engine/types.ts
 * Shared TypeScript types for the Moon Bites decision engine.
 * These mirror the shape of real Swiggy MCP tool responses (Phase 4+).
 */

import { McpDish, McpRestaurant, SpiceLevel } from "../integration/swiggyMcp";

export { SpiceLevel };
export type Dish = McpDish;
export type Restaurant = McpRestaurant;

// ── Engine Input Types ─────────────────────────────────────────────────────────

export type UserConstraints = {
  budget: number;
  veg: boolean;
  spiceLevel?: SpiceLevel;
  blacklistedTags?: string[];
};

export type MoodInput = {
  mood: string;
};

export type ScheduleInput = {
  time: string;   // "HH:MM"
  days: string[]; // ["Mon", "Tue", ...]
  budget: number;
  veg: boolean;
};

// ── Engine Output Types ────────────────────────────────────────────────────────

export type DishRecommendation = {
  restaurant: Pick<Restaurant, "id" | "name" | "cuisine" | "rating" | "distanceKm" | "vegOnly">;
  dish: Dish;
  score: number;
  reason: string;
};

export type SurpriseResult = {
  pick: DishRecommendation;
  alternatives: DishRecommendation[];
};

export type ScheduledMeal = {
  day: string;
  time: string;
  recommendation: DishRecommendation;
};
