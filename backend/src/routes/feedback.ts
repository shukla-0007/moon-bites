/**
 * routes/feedback.ts
 * POST /api/feedback — submit feedback for a past order.
 * Links back to OrderHistory via orderHistoryId.
 */

import express from "express";
import prisma from "../lib/prisma";

const router = express.Router();

type FeedbackBody = {
  orderHistoryId: string;
  rating: "liked" | "disliked";
  tags?: string[];  // ["too_spicy", "too_oily", "too_expensive", "perfect"]
  note?: string;
};

router.post("/", async (req, res) => {
  const { orderHistoryId, rating, tags, note } = req.body as FeedbackBody;
  console.log("[Feedback] submit:", req.body);

  if (!orderHistoryId || !rating) {
    return res.status(400).json({ message: "orderHistoryId and rating are required." });
  }

  if (!["liked", "disliked"].includes(rating)) {
    return res.status(400).json({ message: 'rating must be "liked" or "disliked".' });
  }

  try {
    // Upsert: allow updating feedback if already exists
    const feedback = await prisma.feedback.upsert({
      where: { orderHistoryId },
      create: {
        orderHistoryId,
        rating,
        tags: (tags || []).join(","),
        note: note || null,
      },
      update: {
        rating,
        tags: (tags || []).join(","),
        note: note || null,
      },
    });

    return res.json({ message: "Feedback saved. Thank you!", feedback });
  } catch (err) {
    console.error("[Feedback] save error:", err);
    return res.status(500).json({ message: "Failed to save feedback." });
  }
});

export default router;
