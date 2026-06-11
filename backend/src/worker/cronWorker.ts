/**
 * worker/cronWorker.ts
 * Autonomous meal scheduling engine powered by node-cron.
 *
 * Responsibilities:
 *  - On server boot: load all active schedules from DB, register cron jobs.
 *  - When a cron job fires: run the decision engine, "place" a mock order,
 *    save to OrderHistory, log the event.
 *  - Expose registerSchedule / unregisterSchedule so routes can
 *    add/remove jobs at runtime when user saves or deletes a schedule.
 *
 * Cron expression format: "MM HH * * D1,D2"
 *   MM = minutes, HH = hours, D1,D2 = day-of-week numbers (0=Sun … 6=Sat)
 *
 * Phase 6 note: the mock order placement here will be replaced with a
 * real Swiggy MCP tool call (addToCart + placeOrder). No other changes needed.
 */

import cron, { ScheduledTask } from "node-cron";
import prisma from "../lib/prisma";
import { runSurprise } from "../engine/surpriseEngine";
import { Schedule } from "@prisma/client";
import { swiggyMcpClient, SwiggyMcpError } from "../integration/swiggyMcp";

// ── Day name → cron day-of-week number ────────────────────────────────────
const DAY_TO_CRON: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

// ── In-memory job registry (scheduleId → ScheduledTask) ───────────────────
const activeJobs = new Map<string, ScheduledTask>();

// ── Build cron expression from a Schedule row ──────────────────────────────
function buildCronExpression(schedule: Schedule): string | null {
  const parts = (schedule.time || "").split(":");
  if (parts.length !== 2) return null;
  const h = Number(parts[0]);
  const m = Number(parts[1]);

  if (isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;

  const dayNums = schedule.days
    .split(",")
    .map((d) => DAY_TO_CRON[d.trim()])
    .filter((n) => n !== undefined);

  if (dayNums.length === 0) return null;

  return `${m} ${h} * * ${dayNums.join(",")}`;
}

// ── Fire a scheduled meal (mock order placement via Swiggy MCP) ───────────
async function fireMealJob(schedule: Schedule): Promise<void> {
  const label = schedule.label || "Unnamed Schedule";
  console.log(`\n[CronWorker] ⏰ Firing schedule "${label}" (id: ${schedule.id})`);

  const constraints = {
    budget: schedule.budget,
    veg: schedule.veg,
  };

  try {
    const result = await runSurprise(constraints);

    if (!result) {
      console.log(`[CronWorker] ❌ No dish matched constraints for "${label}". Skipping.`);
      return;
    }

    const { pick } = result;
    console.log(
      `[CronWorker] 🍽️  Mock order candidate: ${pick.dish.name} from ${pick.restaurant.name} ` +
      `(₹${pick.dish.price}) — ${pick.reason}`
    );

    // ── Swiggy MCP Tool Chain Mocking ────────────────────────────────────────
    // 1. Create Cart
    const cart = await swiggyMcpClient.createCart(pick.restaurant.id);
    
    // 2. Add dish to Cart
    await swiggyMcpClient.addToCart(cart.cartId, pick.dish.id, 1);
    
    // 3. Place Order
    const orderResult = await swiggyMcpClient.placeOrder(cart.cartId, "addr_home_1", "COD");

    console.log(`[CronWorker] 📦 Order successfully placed: ${orderResult.orderId} (ETA: ${orderResult.etaMinutes}m)`);

    // Save to OrderHistory as a "cron" flow entry
    try {
      await prisma.orderHistory.create({
        data: {
          flow: "cron",
          restaurantId: pick.restaurant.id,
          restaurantName: pick.restaurant.name,
          dishName: pick.dish.name,
          dishPrice: pick.dish.price,
          constraints: JSON.stringify({
            ...constraints,
            scheduleId: schedule.id,
            label,
            orderId: orderResult.orderId,
            cartId: cart.cartId,
            billTotal: orderResult.cart.totalBill,
            etaMinutes: orderResult.etaMinutes,
          }),
        },
      });
      console.log(`[CronWorker] ✅ Order logged to history.`);
    } catch (err) {
      console.error("[CronWorker] DB write failed:", err);
    }
  } catch (err) {
    if (err instanceof SwiggyMcpError) {
      console.error(`[CronWorker] ❌ Swiggy MCP checkout failed for "${label}": [${err.code}] ${err.message}`);
    } else {
      console.error("[CronWorker] Unexpected failure:", err);
    }
  }
}

// ── Register a single schedule as a cron job ───────────────────────────────
export function registerSchedule(schedule: Schedule): void {
  // Remove any existing job for this schedule first
  unregisterSchedule(schedule.id);

  if (!schedule.active) return;

  const cronExpr = buildCronExpression(schedule);
  if (!cronExpr) {
    console.warn(`[CronWorker] Invalid cron expression for schedule "${schedule.label}". Skipping.`);
    return;
  }

  try {
    const task = cron.schedule(cronExpr, () => fireMealJob(schedule), {
      timezone: "Asia/Kolkata",
    });

    activeJobs.set(schedule.id, task);
    console.log(
      `[CronWorker] ✅ Registered "${schedule.label}" → cron: "${cronExpr}" ` +
      `(${activeJobs.size} total active)`
    );
  } catch (err) {
    console.error(`[CronWorker] ❌ Failed to register node-cron schedule "${schedule.label}":`, err);
  }
}

// ── Unregister and stop a cron job ─────────────────────────────────────────
export function unregisterSchedule(scheduleId: string): void {
  const task = activeJobs.get(scheduleId);
  if (task) {
    task.stop();
    activeJobs.delete(scheduleId);
    console.log(`[CronWorker] 🛑 Unregistered schedule ${scheduleId}`);
  }
}

// ── Bootstrap: load all active schedules from DB on server start ───────────
export async function startCronWorker(): Promise<void> {
  console.log("[CronWorker] 🚀 Starting — loading active schedules from DB...");

  try {
    const schedules = await prisma.schedule.findMany({ where: { active: true } });
    for (const schedule of schedules) {
      registerSchedule(schedule);
    }
    console.log(`[CronWorker] ✅ Loaded ${schedules.length} active schedule(s).`);
  } catch (err) {
    console.error("[CronWorker] Failed to load schedules:", err);
  }
}

// ── Status helpers ─────────────────────────────────────────────────────────
export function getActiveJobCount(): number {
  return activeJobs.size;
}
