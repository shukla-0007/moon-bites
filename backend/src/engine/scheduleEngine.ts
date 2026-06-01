/**
 * engine/scheduleEngine.ts
 * Handles the "Autonomous Schedule" flow.
 *
 * Algorithm:
 *  1. Parse time → lunch / dinner / other
 *  2. Per day: run the surprise engine with time-adjusted constraints (async)
 *  3. Enforce variety: if a dish was already picked for a previous day,
 *     retry up to 5 times to get a different one
 *  4. Build and return the full week plan
 */

import { runSurprise } from "./surpriseEngine";
import { ScheduleInput, ScheduledMeal, UserConstraints } from "./types";

function getTimeOfDay(time: string): "lunch" | "dinner" | "other" {
  const hour = Number(time.split(":")[0]);
  if (hour >= 11 && hour <= 15) return "lunch";
  if (hour >= 18 && hour <= 22) return "dinner";
  return "other";
}

export async function runSchedule(input: ScheduleInput): Promise<ScheduledMeal[]> {
  const { time, days, budget, veg } = input;
  const timeOfDay = getTimeOfDay(time);

  // Slightly tighter budget for lunch; full budget for dinner
  const adjustedBudget =
    timeOfDay === "lunch" ? Math.min(budget, Math.round(budget * 0.75)) : budget;

  const baseConstraints: UserConstraints = { budget: adjustedBudget, veg };
  const usedDishIds = new Set<string>();
  const meals: ScheduledMeal[] = [];

  for (const day of days) {
    let pick = null;

    // Try up to 5 times to get a dish not already in the week plan
    for (let attempt = 0; attempt < 5; attempt++) {
      const result = await runSurprise(baseConstraints);
      if (!result) break;

      if (!usedDishIds.has(result.pick.dish.id)) {
        pick = result.pick;
        break;
      }

      // On the last attempt, accept the repeat rather than leaving a gap
      if (attempt === 4) {
        pick = result.pick;
      }
    }

    if (pick) {
      usedDishIds.add(pick.dish.id);
      meals.push({
        day,
        time,
        recommendation: pick,
      });
    }
  }

  return meals;
}
