/**
 * routes/surprise.ts  (Phase 5)
 * Thin route wrapper: validates input → calls surpriseEngine (async) → 
 * executes Swiggy MCP Cart/Checkout sequence → saves to DB → responds.
 * Supports retrying checkout for a specific dish when failures strike.
 */

import express from "express";
import { runSurprise } from "../engine/surpriseEngine";
import { UserConstraints, SpiceLevel, DishRecommendation } from "../engine/types";
import prisma from "../lib/prisma";
import { swiggyMcpClient, SwiggyMcpError } from "../integration/swiggyMcp";
import { MOCK_RESTAURANTS } from "../data/mockRestaurants";

const router = express.Router();

type SurpriseRequestBody = {
  budget: number;
  veg: boolean;
  spiceLevel?: SpiceLevel;
  retryDishId?: string;
};

router.post("/", async (req, res, next) => {
  try {
    const { budget, veg, spiceLevel, retryDishId } = req.body as SurpriseRequestBody;
    console.log("[Surprise] request body:", req.body);

    const budgetNum = Number(budget);
    if (isNaN(budgetNum) || budgetNum < 50 || budgetNum > 5000) {
      return res.status(400).json({ message: "Budget must be a number between 50 and 5000." });
    }

    if (spiceLevel !== undefined && ![1, 2, 3].includes(Number(spiceLevel))) {
      return res.status(400).json({ message: "Spice level must be 1 (Mild), 2 (Medium), or 3 (Spicy)." });
    }

    let pick: DishRecommendation | null = null;
    let alternatives: DishRecommendation[] = [];

    if (retryDishId) {
      // Find the dish in the mock data
      const restaurant = MOCK_RESTAURANTS.find(r => r.dishes.some(d => d.id === retryDishId));
      const dish = restaurant?.dishes.find(d => d.id === retryDishId);
      
      if (restaurant && dish) {
        pick = {
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            cuisine: restaurant.cuisine,
            rating: restaurant.rating,
            distanceKm: restaurant.distanceKm,
            vegOnly: restaurant.vegOnly,
          },
          dish,
          score: 100,
          reason: "Retrying previous order selection",
        };
      }
    } else {
      const constraints: UserConstraints = { budget: budgetNum, veg: Boolean(veg), spiceLevel };
      const result = await runSurprise(constraints);
      if (result) {
        pick = result.pick;
        alternatives = result.alternatives;
      }
    }

    if (!pick) {
      return res.json({
        message: "No restaurants match your criteria. Try loosening your filters.",
        pick: null,
        alternatives: [],
        saved: false,
      });
    }

    // ── Swiggy MCP Tool Chain Mocking ──────────────────────────────────────────
    try {
      // 1. Create Cart
      const cart = await swiggyMcpClient.createCart(pick.restaurant.id);
      
      // 2. Add dish to Cart
      await swiggyMcpClient.addToCart(cart.cartId, pick.dish.id, 1);
      
      // 3. Place Order
      const orderResult = await swiggyMcpClient.placeOrder(cart.cartId, "addr_home_1", "COD");

      // Save to OrderHistory (userId null — auth comes in Phase 6)
      let saved = false;
      try {
        await prisma.orderHistory.create({
          data: {
            flow: "surprise",
            restaurantId: pick.restaurant.id,
            restaurantName: pick.restaurant.name,
            dishName: pick.dish.name,
            dishPrice: pick.dish.price,
            constraints: JSON.stringify({
              budget: budgetNum,
              veg: Boolean(veg),
              spiceLevel,
              orderId: orderResult.orderId,
              cartId: cart.cartId,
              billTotal: orderResult.cart.totalBill,
              etaMinutes: orderResult.etaMinutes,
              retryDishId,
            }),
          },
        });
        saved = true;
      } catch (err) {
        console.error("[Surprise] DB save failed:", err);
      }

      return res.json({
        message: "Surprise Me recommendation",
        pick,
        alternatives,
        order: {
          orderId: orderResult.orderId,
          status: orderResult.status,
          etaMinutes: orderResult.etaMinutes,
          trackUrl: orderResult.trackUrl,
          billTotal: orderResult.cart.totalBill,
        },
        saved,
        error: null,
      });
    } catch (err) {
      if (err instanceof SwiggyMcpError) {
        console.warn(`[Surprise API Checkout] Swiggy MCP error: [${err.code}] ${err.message}`);
        // Return 200 with error details so UI can render the card and retry button!
        return res.json({
          message: "Surprise Me recommendation - checkout failed",
          pick,
          alternatives,
          order: null,
          error: err.message,
          errorCode: err.code,
          saved: false,
        });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;
