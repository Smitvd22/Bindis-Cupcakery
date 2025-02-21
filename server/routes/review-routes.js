// review-routes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/authorization');

// Get pending reviews for the user
router.get('/reviews/pending', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        upr.id,
        upr.product_id,
        upr.order_id,
        p.name as product_name,
        p.image_url,
        oh.picked_up_at
      FROM user_pending_reviews upr
      JOIN products p ON p.product_id = upr.product_id
      JOIN order_history oh ON oh.order_id = upr.order_id
      WHERE upr.user_id = $1 
      AND upr.review_status = 'pending'
      AND NOT EXISTS (
        SELECT 1 FROM reviews r 
        WHERE r.product_id = upr.product_id 
        AND r.user_id = upr.user_id
      )
      ORDER BY oh.picked_up_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a review
router.post('/reviews', auth, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { product_id, order_id, rating, comment } = req.body;
    
    // Insert the review
    await client.query(`
      INSERT INTO reviews (product_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
    `, [product_id, req.user.id, rating, comment]);

    // Update the pending review status
    await client.query(`
      UPDATE user_pending_reviews
      SET review_status = 'completed'
      WHERE user_id = $1 AND product_id = $2 AND order_id = $3
    `, [req.user.id, product_id, order_id]);

    // Update product rating and review count
    await client.query(`
      WITH review_stats AS (
        SELECT 
          AVG(rating)::DECIMAL(2,1) as avg_rating,
          COUNT(*) as total_reviews
        FROM reviews
        WHERE product_id = $1
      )
      UPDATE products
      SET rating = review_stats.avg_rating,
          review_count = review_stats.total_reviews
      FROM review_stats
      WHERE product_id = $1
    `, [product_id]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Skip a review
router.post('/reviews/skip', auth, async (req, res) => {
  try {
    const { product_id, order_id } = req.body;
    
    await pool.query(`
      UPDATE user_pending_reviews
      SET review_status = 'skipped',
          last_prompted_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND product_id = $2 AND order_id = $3
    `, [req.user.id, product_id, order_id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;