const express = require("express");
const router = express.Router();
const pool = require("../db"); // Your database connection
const { validate: isUuid } = require("uuid"); // Import UUID validator

router.get("/pending/:userId", async (req, res) => {
    try {
        let { userId } = req.params;
        console.log(`Fetching pending reviews for user: ${userId}`);

        if (!userId || !isUuid(userId)) {
            return res.status(400).json({ error: "Invalid userId format" });
        }

        // First, check if there are any reviewed products that need to be cleaned up
        await pool.query(
            `DELETE FROM user_pending_reviews
             WHERE user_id = $1
             AND EXISTS (
                 SELECT 1 
                 FROM reviews r 
                 WHERE r.product_id = user_pending_reviews.product_id 
                 AND r.user_id = user_pending_reviews.user_id
             )`,
            [userId]
        );

        // Updated query to show only one review prompt per product
        const pendingReviews = await pool.query(
            `SELECT DISTINCT ON (upr.product_id) 
                upr.id, upr.product_id, upr.order_id, 
                p.name AS product_name, p.image_url, upr.created_at
            FROM user_pending_reviews upr
            JOIN products p ON upr.product_id = p.product_id
            WHERE upr.user_id = $1 
            AND NOT EXISTS (
                SELECT 1 
                FROM reviews r 
                WHERE r.product_id = upr.product_id 
                AND r.user_id = upr.user_id
            )
            AND dialog_shown = false
            ORDER BY upr.product_id, upr.created_at ASC`, 
            [userId]
        );

        if (pendingReviews.rows.length === 0) {
            return res.json({ showDialog: false });
        }

        res.json({
            showDialog: true,
            reviews: pendingReviews.rows,
            currentReview: pendingReviews.rows[0]
        });
    } catch (error) {
        console.error("Error fetching pending reviews:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/submit", async (req, res) => {
    try {
      const { userId, productId, orderId, rating, comment, reviewId } = req.body;
  
      // 1. Insert the review
      await pool.query(
        `INSERT INTO reviews (user_id, product_id, rating, comment, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [userId, productId, rating, comment]
      );
  
      // 2. Delete specific pending entry (not all for product)
      await pool.query(
        `DELETE FROM user_pending_reviews 
         WHERE id = $1`,
        [reviewId]
      );
  
      res.json({ success: true });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Keep mark-shown endpoint as-is
  router.post("/mark-shown", async (req, res) => {
    try {
      const { reviewId } = req.body;
      await pool.query(
        `UPDATE user_pending_reviews SET dialog_shown = true WHERE id = $1`,
        [reviewId]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating dialog status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

router.post("/reset-dialog-shown", async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId || !isUuid(userId)) {
            return res.status(400).json({ error: "Invalid userId format" });
        }
        await pool.query(
            `UPDATE user_pending_reviews
             SET dialog_shown = false
             WHERE user_id = $1`,
            [userId]
        );
        res.json({ success: true });
    } catch (error) {
        console.error("Error resetting dialog shown:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
