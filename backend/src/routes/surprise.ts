/**
 * routes/surprise.ts  (Phase 4)
 * Thin route wrapper: validates input → calls surpriseEngine (async) → 
 * executes Swiggy MCP Cart/Checkout sequence → saves to DB → responds.
 */

import express from "express";
import { runSurprise } from "../engine/surpriseEngine";
import { UserConstraints, SpiceLevel } from "../engine/types";
import prisma from "../lib/prisma";
import { swiggyMcpClient, SwiggyMcpError } from "../integration/swiggyMcp";

const router = express.Router();

type SurpriseRequestBody = {
  budget: number;
  veg: boolean;
  spiceLevel?: SpiceLevel;
};

router.post("/", async (req, res, next) => {
  try {
    const { budget, veg, spiceLevel } = req.body as SurpriseRequestBody;
    console.log("[Surprise] request body:", req.body);

    const constraints: UserConstraints = { budget, veg, spiceLevel };
    const result = await runSurprise(constraints);

    if (!result) {
      return res.json({
        message: "No restaurants match your criteria. Try loosening your filters.",
        pick: null,
        alternatives: [],
        saved: false,
      });
    }

    // ── Swiggy MCP Tool Chain Mocking ──────────────────────────────────────────
    // 1. Create Cart
    const cart = await swiggyMcpClient.createCart(result.pick.restaurant.id);
    
    // 2. Add dish to Cart
    await swiggyMcpClient.addToCart(cart.cartId, result.pick.dish.id, 1);
    
    // 3. Place Order
    const orderResult = await swiggyMcpClient.placeOrder(cart.cartId, "addr_home_1", "COD");

    // Save to OrderHistory (userId null — auth comes in Phase 6)
    let saved = false;
    try {
      await prisma.orderHistory.create({
        data: {
          flow: "surprise",
          restaurantId: result.pick.restaurant.id,
          restaurantName: result.pick.restaurant.name,
          dishName: result.pick.dish.name,
          dishPrice: result.pick.dish.price,
          constraints: JSON.stringify({
            ...constraints,
            orderId: orderResult.orderId,
            cartId: cart.cartId,
            billTotal: orderResult.cart.totalBill,
            etaMinutes: orderResult.etaMinutes,
          }),
        },
      });
      saved = true;
    } catch (err) {
      console.error("[Surprise] DB save failed:", err);
    }

    return res.json({
      message: "Surprise Me recommendation",
      pick: result.pick,
      alternatives: result.alternatives,
      order: {
        orderId: orderResult.orderId,
        status: orderResult.status,
        etaMinutes: orderResult.etaMinutes,
        trackUrl: orderResult.trackUrl,
        billTotal: orderResult.cart.totalBill,
      },
      saved,
    });
  } catch (err) {
    if (err instanceof SwiggyMcpError) {
      console.warn(`[Surprise API] Swiggy MCP error: [${err.code}] ${err.message}`);
      return res.status(500).json({
        error: err.message,
        code: err.code,
        message: "Swiggy order placement failed. Please try again.",
      });
    }
    next(err);
  }
});

export default router;
