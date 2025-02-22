const express = require("express");
const pool = require("../db"); 

const router = express.Router();

// Get all current orders
router.get("/current-orders", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, u.user_name 
       FROM current_orders c
       JOIN users u ON c.user_id = u.user_id
       ORDER BY c.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching current orders:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/current-orders/:orderId/status", async (req, res) => {
  const { orderId } = req.params;
  const { status, rejection_reason } = req.body;
  const client = await pool.connect();
  let whatsappStatus = true;
  
  try {
    await client.query('BEGIN');
    
    const currentOrder = await client.query(`
      SELECT 
        c.*, 
        u.user_name,
        u.user_email
      FROM current_orders c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.order_id = $1
    `, [orderId]);
    
    if (currentOrder.rows.length === 0) {
      throw new Error('Order not found');
    }
    
    const orderData = currentOrder.rows[0];
    const now = new Date();

    if (status === 'rejected') {
      // Insert into order_history with correct columns
      const parsedItems = JSON.stringify(orderData.items); // Convert array to JSON string

      await client.query(`
          INSERT INTO order_history (
            order_id, 
            user_id, 
            items, 
            total, 
            created_at,
            contact_phone,
            order_status,
            admin_status,
            rejected_at,
            rejection_reason,
            reviewed,
            review_request_sent,
            reviews_processed,
            status
          )
          VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [
        orderData.order_id,
        orderData.user_id,
        parsedItems,  // ✅ Ensure JSONB compatibility
        orderData.total,
        orderData.created_at,
        orderData.contact_phone,
        'rejected',
        'rejected',
        now,
        rejection_reason || null,
        false, // reviewed
        false, // review_request_sent
        false, // reviews_processed
        'rejected' // status
      ]);

      // Delete from current_orders
      await client.query(
        'DELETE FROM current_orders WHERE order_id = $1',
        [orderId]
      );
      // Send rejection notification
      try {
        const twilioClient = req.app.get('twilioClient');
        
        const itemsList = orderData.items
          .map(item => `  • ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
          .join('\n');

        const message = `⚠️ Order Rejected ⚠️\n\n
        Hello ${orderData.user_name},\n
        We regret to inform you that your order could not be processed.\n
        🔹 Order ID: ${orderData.order_id}\n
        🔹 Items:\n${itemsList}\n
        🔹 Total: ₹${Number(orderData.total)}\n
        Reason: ${rejection_reason || "Unavailable ingredients or operational constraints"}\n
        We apologize for the inconvenience. Please contact us for any queries.\n\n
        🍩 Bindi's Cupcakery 🍩\n📞 Contact: +918849130189`;

        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE,
          to: `whatsapp:+91${orderData.contact_phone}`
        });
      } catch (whatsappError) {
        console.error("WhatsApp notification failed:", whatsappError);
        whatsappStatus = false;
        // Continue processing despite WhatsApp failure
      }

    } else if (status === 'accepted') {
      await client.query(`
        UPDATE current_orders 
        SET 
          admin_status = $1,
          accepted_at = $2
        WHERE order_id = $3
      `, ['accepted', now, orderId]);

      // Send acceptance notification
      try {
        const twilioClient = req.app.get('twilioClient');

        // Format items list
        const itemsList = orderData.items
          .map(item => `  • ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
          .join('\n');

        // Construct message
        const message = `✅ Order Accepted ✅\n\n
        Hello ${orderData.user_name},\n
        Great news! Your order has been accepted and is being prepared with care.\n
        🔹 Order ID: ${orderData.order_id}\n
        🔹 Items:\n${itemsList}\n
        🔹 Total: ₹${orderData.total}\n
        🔹 Estimated Time: ${orderData.estimated_time || "30"} mins\n
        We’ll notify you once it’s ready for pickup/delivery.\n
        Thank you for choosing us! 🍰\n\n
        🍩 Bindi's Cupcakery 🍩\n📞 Contact: +918849130189`;

        // Send WhatsApp
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE,
          to: `whatsapp:+91${orderData.contact_phone}`
        });
      } catch (whatsappError) {
        console.error("WhatsApp notification failed:", whatsappError);
        whatsappStatus = false;
        // Continue processing despite WhatsApp failure
      }
    }

    await client.query('COMMIT');

    res.json({
      message: `Order ${status} successfully`,
      order: currentOrder.rows[0],
      whatsappStatus: whatsappStatus ? 'Message sent successfully on WhatsApp' : 'WhatsApp message failed to send'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating order status:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
      whatsappStatus: 'WhatsApp message failed to send'
    });
  } finally {
    client.release();
  }
});


router.put("/current-orders/:orderId/pickup-status", async (req, res) => {
  const { orderId } = req.params;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get current order details with user info
    const currentOrder = await client.query(`
      SELECT 
        c.*, 
        u.user_name,
        u.user_email
      FROM current_orders c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.order_id = $1
    `, [orderId]);
    
    if (currentOrder.rows.length === 0) {
      throw new Error('Order not found');
    }
    
    const orderData = currentOrder.rows[0];
    const currentStatus = orderData.pickup_status;
    const newStatus = currentStatus === 'ready_for_pickup' ? 'preparing' : 'ready_for_pickup';

    // Update pickup status
    await client.query(
      'UPDATE current_orders SET pickup_status = $1 WHERE order_id = $2',
      [newStatus, orderId]
    );

    await client.query('COMMIT');

    // Send WhatsApp notification only when marking as ready_for_pickup
    if (newStatus === 'ready_for_pickup') {
      const twilioClient = req.app.get('twilioClient');
      
      // Format items list
      const itemsList = orderData.items
        .map(item => `  • ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
        .join('\n');

      // Construct message
      const message = `🚀 Order Ready for Pickup 🚀\n\n
      Hello ${orderData.user_name},\n
      Your order is now ready for pickup!\n
      Here are your order details:\n
      🔹 Order ID: ${orderData.order_id}\n
      🔹 Items:\n${itemsList}\n
      🔹 Total: ₹${orderData.total}\n
      🔹 Pickup Location: ${orderData.pickup_location ||'Cloud kitchen in Parle Point, Surat'}
      Please collect it at your earliest convenience. Enjoy your treats! 🍩✨\n
      Thank you for choosing us! 🍰\n
      We look forward to serving you again soon.🎂\n\n
      🍩 Bindi's Cupcakery 🍩\n📞 Contact: +918849130189`;

      // Send WhatsApp
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE,
        to: `whatsapp:+91${orderData.contact_phone}`
      });
    }

    res.json({ 
      message: "Pickup status updated successfully",
      new_status: newStatus
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error updating pickup status:", error);
    res.status(500).json({ 
      error: "Internal Server Error",
      details: error.message 
    });
  } finally {
    client.release();
  }
});

router.put("/current-orders/:orderId/pickup", async (req, res) => {
  const { orderId } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // First, fetch the current order to ensure it exists and get its details
    const currentOrder = await client.query(
      'SELECT * FROM current_orders WHERE order_id = $1',
      [orderId]
    );

    if (currentOrder.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Order not found" });
    }

    const orderData = currentOrder.rows[0];

    // Parse and validate items
    let itemsArray;
    try {
      // If items is a string, parse it
      itemsArray = typeof orderData.items === 'string'
        ? JSON.parse(orderData.items)
        : orderData.items;

      // If items is not an array, wrap it in an array
      if (!Array.isArray(itemsArray)) {
        itemsArray = [itemsArray];
      }

      // Validate each item has either product_id or hamper_id
      itemsArray = itemsArray.map(item => {
        // For products
        if (item.item_type === 'product' && !item.product_id) {
          throw new Error('Missing product_id for product item');
        }
        // For hampers
        if (item.item_type === 'hamper' && !item.hamper_id) {
          throw new Error('Missing hamper_id for hamper item');
        }
        return item;
      });
    } catch (error) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: "Invalid items format",
        details: error.message
      });
    }

    // Move the order to history with properly formatted items
    const historyResult = await client.query(`
      INSERT INTO order_history
        (order_id, user_id, items, total, picked_up_at, created_at, contact_phone)
      VALUES
        ($1, $2, $3::jsonb, $4, NOW(), $5, $6)
      RETURNING *
    `, [
      orderData.order_id,
      orderData.user_id,
      JSON.stringify(itemsArray),
      orderData.total,
      orderData.created_at,
      orderData.contact_phone
    ]);

    // Delete from current orders
    await client.query(
      'DELETE FROM current_orders WHERE order_id = $1',
      [orderId]
    );

    await client.query('COMMIT');

    res.json({
      message: "Order moved to history successfully",
      order: historyResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error moving order:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error.message
    });
  } finally {
    client.release();
  }
});

// Get order history
router.get("/order-history", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.*, u.user_name 
       FROM order_history h
       JOIN users u ON h.user_id = u.user_id
       ORDER BY h.picked_up_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching order history:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Request review from a user
router.post("/order-history/:orderId/request-review", async (req, res) => {
  const { orderId } = req.params;

  try {
    const { rowCount } = await pool.query(
      "UPDATE order_history SET review_request_sent = true WHERE order_id = $1 AND reviewed = false",
      [orderId]
    );

    if (rowCount === 0) return res.status(404).json({ error: "Order not found or already reviewed" });

    res.json({ message: "Review request sent successfully" });
  } catch (err) {
    console.error("Error requesting review:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all categories with their products
router.get("/categories", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'product_id', p.product_id,
              'name', p.name,
              'description', p.description,
              'price', p.price,
              'image_url', p.image_url,
              'is_active', p.is_active,
              'is_bestseller', p.is_bestseller,
              'is_eggless', p.is_eggless,
              'shape', p.shape,
              'type', p.type,
              'available_weights', p.available_weights,
              'variants', p.variants
            )
          ) FILTER (WHERE p.product_id IS NOT NULL),
          '[]'
        ) as products
      FROM categories c
      LEFT JOIN products p ON c.category_id = p.category_id
      GROUP BY c.category_id
      ORDER BY c.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add new category
router.post("/categories", async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *",
      [name, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete category
router.delete("/categories/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Delete all products in the category first
    await client.query(
      "DELETE FROM products WHERE category_id = $1",
      [categoryId]
    );

    // Then delete the category
    const result = await client.query(
      "DELETE FROM categories WHERE category_id = $1 RETURNING *",
      [categoryId]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
});


router.post("/products", async (req, res) => {
  const {
    category_id,
    name,
    description,
    price,
    image_url,
    is_bestseller,
    is_eggless,
    shape,
    type,
    available_weights,
    variants
  } = req.body;

  try {
    // Get the current max product_id
    const maxIdResult = await pool.query("SELECT COALESCE(MAX(product_id), 49) AS max_id FROM products");

    // Assign the next available product_id
    const newProductId = maxIdResult.rows[0].max_id + 1;

    // Insert product with generated product_id
    const result = await pool.query(
      `INSERT INTO products (
        product_id, category_id, name, description, price, image_url, 
        is_bestseller, is_eggless, shape, type, 
        available_weights, variants
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        newProductId, category_id, name, description, price, image_url,
        is_bestseller, is_eggless, shape, type,
        available_weights, variants
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete product
router.delete("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM products WHERE product_id = $1 RETURNING *",
      [productId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Toggle product availability
router.patch("/products/:productId/toggle-status", async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      "UPDATE products SET is_active = NOT is_active WHERE product_id = $1 RETURNING *",
      [productId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error toggling product status:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all customer reviews
router.get("/reviews", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.review_id,
        r.product_id,
        r.rating,
        r.comment,
        r.created_at,
        r.display_on_homepage,
        p.name as product_name,
        u.user_name,
        u.user_id
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      LEFT JOIN users u ON r.user_id = u.user_id
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Toggle review homepage display status
router.patch("/reviews/:reviewId/toggle-homepage", async (req, res) => {
  const { reviewId } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if we're trying to add to homepage and how many are already there
    const { rows: [{ display_status }] } = await client.query(
      "SELECT display_on_homepage as display_status FROM reviews WHERE review_id = $1",
      [reviewId]
    );

    if (!display_status) {
      const { rows: [{ count }] } = await client.query(
        "SELECT COUNT(*) FROM reviews WHERE display_on_homepage = true"
      );

      // Limit to 5 reviews on homepage
      if (parseInt(count) >= 5) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: "Maximum number of homepage reviews reached (5). Please remove one before adding another."
        });
      }
    }

    // Toggle the status
    const result = await client.query(
      `UPDATE reviews 
       SET display_on_homepage = NOT display_on_homepage 
       WHERE review_id = $1 
       RETURNING *`,
      [reviewId]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error toggling review homepage status:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
});

// Get homepage reviews
router.get("/reviews/homepage", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        r.review_id,
        r.product_id,
        r.rating,
        r.comment,
        r.created_at,
        r.display_on_homepage,
        p.name as product_name,
        u.user_name,
        u.user_id
      FROM reviews r
      JOIN products p ON r.product_id = p.product_id
      LEFT JOIN users u ON r.user_id = u.user_id
      WHERE r.display_on_homepage = true
      ORDER BY r.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching homepage reviews:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get orders pending review for a user
router.get("/orders/pending-reviews", async (req, res) => {
  // In a real app, you'd get the user_id from the session/token
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT 
        oh.*,
        u.user_name,
        u.user_email
      FROM order_history oh
      JOIN users u ON oh.user_id = u.user_id
      WHERE oh.user_id = $1 
      AND oh.review_request_sent = true 
      AND oh.reviewed = false
      ORDER BY oh.picked_up_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching pending reviews:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Submit a new review
router.post("/reviews/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { product_id, rating, comment, user_id } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert the review
    const reviewResult = await client.query(`
      INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *
    `, [product_id, user_id, rating, comment]);

    // Update the order history
    await client.query(`
      UPDATE order_history 
      SET reviewed = true 
      WHERE order_id = $1
    `, [orderId]);

    // Update product rating and review count
    await client.query(`
      WITH review_stats AS (
        SELECT 
          product_id,
          AVG(rating)::numeric(2,1) as avg_rating,
          COUNT(*) as total_reviews
        FROM reviews
        WHERE product_id = $1
        GROUP BY product_id
      )
      UPDATE products
      SET rating = review_stats.avg_rating,
          review_count = review_stats.total_reviews
      FROM review_stats
      WHERE products.product_id = review_stats.product_id
    `, [product_id]);

    await client.query('COMMIT');
    res.status(201).json(reviewResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    client.release();
  }
});

// Mark order as reviewed
router.patch("/orders/:orderId/mark-reviewed", async (req, res) => {
  const { orderId } = req.params;

  try {
    const result = await pool.query(`
      UPDATE order_history 
      SET reviewed = true 
      WHERE order_id = $1
      RETURNING *
    `, [orderId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error marking order as reviewed:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
