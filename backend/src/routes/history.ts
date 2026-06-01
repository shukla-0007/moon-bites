/**
 * routes/history.ts
 * GET /api/history — returns recent order history (last 10), newest first.
 * Each entry includes feedback if it exists.
 */

import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const orders = await prisma.orderHistory.findMany({
      orderBy: { placedAt: "desc" },
      take: 10,
      include: {
        feedback: true,
      },
    });

    return res.json({ orders });
  } catch (err) {
    console.error("[History] fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch history." });
  }
});

export default router;
