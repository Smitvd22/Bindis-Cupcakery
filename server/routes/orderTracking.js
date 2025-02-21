const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorization = require('../middleware/authorization'); // Use your existing authorization middleware

// Get current active order
router.get('/current-order', authorization, async (req, res) => {
  try {
    const userId = req.user;
    
    const query = `
      SELECT 
        order_id,
        items,
        total,
        created_at,
        order_status,
        admin_status,
        pickup_status,
        ready_for_pickup,
        accepted_at,
        rejected_at,
        ready_at,
        rejection_reason
      FROM current_orders
      WHERE user_id = $1 
        AND (pickup_status != 'picked_up' OR admin_status = 'rejected')
      ORDER BY created_at DESC 
      LIMIT 1`;

    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return res.json(null);
    }

    // Send the raw database row - frontend will handle the status logic
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching current order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get order history
router.get("/order-history", authorization, async (req, res) => {
  try {
    const userId = req.user; // This comes from the authorization middleware

    const result = await pool.query(
      `SELECT h.*, u.user_name 
       FROM order_history h
       JOIN users u ON h.user_id = u.user_id
       WHERE h.user_id = $1
       ORDER BY h.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;