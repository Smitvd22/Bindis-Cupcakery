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

        // Clean up reviews that have already been submitted
        await pool.query(`
            DELETE FROM user_pending_reviews upr
            WHERE EXISTS (
                SELECT 1 
                FROM reviews r 
                WHERE r.user_id = upr.user_id 
                AND r.product_id = upr.product_id
                AND r.order_id = upr.order_id
            )
        `);

        // Get only unique pending reviews that haven't been shown yet
        const pendingReviews = await pool.query(`
            SELECT DISTINCT ON (upr.order_id, upr.product_id) 
                upr.id,
                upr.product_id,
                upr.order_id,
                p.name as product_name,
                p.image_url,
                oh.picked_up_at
            FROM user_pending_reviews upr
            JOIN products p ON upr.product_id = p.product_id
            JOIN order_history oh ON oh.order_id = upr.order_id
            WHERE upr.user_id = $1 
            AND upr.review_status = 'pending'
            AND NOT upr.dialog_shown
            AND NOT EXISTS (
                SELECT 1 
                FROM reviews r 
                WHERE r.user_id = upr.user_id 
                AND r.product_id = upr.product_id
                AND r.order_id = upr.order_id
            )
            ORDER BY upr.order_id, upr.product_id, upr.created_at DESC
        `, [userId]);

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

// Update the submit endpoint to properly mark the review as completed
router.post("/submit", async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const { userId, productId, orderId, rating, comment, reviewId } = req.body;

        // Insert the review with order_id
        await client.query(
            `INSERT INTO reviews (user_id, product_id, order_id, rating, comment, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())`,
            [userId, productId, orderId, rating, comment]
        );

        // Mark the specific review request as completed
        await client.query(
            `UPDATE user_pending_reviews 
             SET review_status = 'completed', dialog_shown = true
             WHERE id = $1`,
            [reviewId]
        );

        await client.query('COMMIT');
        res.json({ success: true });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error submitting review:", error);
        res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
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
