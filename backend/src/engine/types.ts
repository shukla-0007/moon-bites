/**
 * engine/types.ts
 * Shared TypeScript types for the Moon Bites decision engine.
 * These mirror the shape of real Swiggy MCP tool responses (Phase 4+).
 */

// ── Data Model ────────────────────────────────────────────────────────────────

export type SpiceLevel = 1 | 2 | 3; // 1 = mild, 2 = medium, 3 = spicy

export type Dish = {
  id: string;
  name: string;
  price: number; // in ₹
  isVeg: boolean;
  spiceLevel: SpiceLevel;
  tags: string[];
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  avgPriceForTwo: number;
  vegOnly: boolean;
  tags: string[];
  rating: number; // 1–5
  distanceKm: number;
  dishes: Dish[];
};

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
