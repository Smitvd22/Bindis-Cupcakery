// routes/cart.js
const router = require("express").Router();
const pool = require('../db');
const authorization = require("../middleware/authorization");
const twilio = require('twilio');
const TWILIO_PHONE = process.env.TWILIO_PHONE;

// Add item to cart
router.post("/add", authorization, async (req, res) => {
    try {
        const user_id = req.user;
        const { product_id, hamper_id, quantity, price } = req.body;

        if (!price || !quantity || ((!product_id && !hamper_id) || (product_id && hamper_id))) {
            return res.status(400).json({
                error: "Invalid request. Must provide either product_id or hamper_id, price, and quantity"
            });
        }

        // Get or create cart
        let cartResult = await pool.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [user_id]
        );

        if (cartResult.rows.length === 0) {
            cartResult = await pool.query(
                "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
                [user_id]
            );
        }

        const cart_id = cartResult.rows[0].id;

        // Check if item already exists in cart
        const existingItemQuery = `
            SELECT id, quantity 
            FROM cart_items 
            WHERE cart_id = $1 
            AND COALESCE(product_id, -1) = COALESCE($2, -1)
            AND COALESCE(hamper_id, -1) = COALESCE($3, -1)
        `;
        
        const existingItem = await pool.query(existingItemQuery, [
            cart_id,
            product_id || null,
            hamper_id || null
        ]);

        if (existingItem.rows.length > 0) {
            // Update quantity if item exists
            const updatedItem = await pool.query(
                "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
                [quantity, existingItem.rows[0].id]
            );
            res.json({ success: true, item: updatedItem.rows[0] });
        } else {
            // Add new item
            const newItem = await pool.query(
                `INSERT INTO cart_items 
                (cart_id, product_id, hamper_id, quantity, price_at_time) 
                VALUES ($1, $2, $3, $4, $5) 
                RETURNING *`,
                [cart_id, product_id || null, hamper_id || null, quantity, price]
            );
            res.json({ success: true, item: newItem.rows[0] });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// for adding hampers to the cart
router.post("/add2", authorization, async (req, res) => {
    try {
        const user_id = req.user;
        const { quantity, price, is_custom, items } = req.body;

        // Start a transaction since we'll be doing multiple operations
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Get or create cart
            let cartResult = await client.query(
                "SELECT id FROM carts WHERE user_id = $1",
                [user_id]
            );

            if (cartResult.rows.length === 0) {
                cartResult = await client.query(
                    "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
                    [user_id]
                );
            }

            const cart_id = cartResult.rows[0].id;

            let hamper_id;
            if (is_custom) {
                // Create a new hamper record for the custom hamper
                const hamperResult = await client.query(
                    `INSERT INTO hampers (
                        name, 
                        price, 
                        hamper_type, 
                        contents, 
                        is_active
                    ) VALUES ($1, $2, $3, $4, $5) 
                    RETURNING hamper_id`,
                    [
                        'Custom Hamper', // or generate a meaningful name
                        price,
                        'custom',
                        JSON.stringify(items),
                        true
                    ]
                );
                hamper_id = hamperResult.rows[0].hamper_id;
            }

            // Check if item already exists in cart
            const existingItemQuery = `
                SELECT id, quantity 
                FROM cart_items 
                WHERE cart_id = $1 
                AND hamper_id = $2
                AND is_custom = $3
            `;
            
            const existingItem = await client.query(existingItemQuery, [
                cart_id,
                hamper_id,
                is_custom || false
            ]);

            let result;
            if (existingItem.rows.length > 0) {
                // Update quantity if item exists
                result = await client.query(
                    "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2 RETURNING *",
                    [quantity, existingItem.rows[0].id]
                );
            } else {
                // Add new item
                result = await client.query(
                    `INSERT INTO cart_items 
                    (cart_id, hamper_id, quantity, price_at_time, is_custom, custom_items) 
                    VALUES ($1, $2, $3, $4, $5, $6) 
                    RETURNING *`,
                    [
                        cart_id,
                        hamper_id,
                        quantity,
                        price,
                        is_custom || false,
                        is_custom ? JSON.stringify(items) : null
                    ]
                );
            }

            await client.query('COMMIT');
            res.json({ success: true, item: result.rows[0] });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});

// Modified GET cart items route
router.get("/", authorization, async (req, res) => {
    try {
        const user_id = req.user;

        // First get or create cart
        let cartResult = await pool.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [user_id]
        );

        if (cartResult.rows.length === 0) {
            cartResult = await pool.query(
                "INSERT INTO carts (user_id) VALUES ($1) RETURNING id",
                [user_id]
            );
        }

        const cart_id = cartResult.rows[0].id;

        // Get cart items with both product and hamper details
        const cartItemsQuery = `
            SELECT 
                ci.id,
                ci.quantity,
                ci.price_at_time,
                CASE 
                    WHEN ci.product_id IS NOT NULL THEN 'product'
                    ELSE 'hamper'
                END as item_type,
                COALESCE(p.name, h.name) as name,
                COALESCE(p.image_url, h.image_url) as image_url,
                ci.product_id,
                ci.hamper_id,
                ci.customizations
            FROM cart_items ci
            LEFT JOIN products p ON ci.product_id = p.product_id
            LEFT JOIN hampers h ON ci.hamper_id = h.hamper_id
            WHERE ci.cart_id = $1
        `;

        const cartItems = await pool.query(cartItemsQuery, [cart_id]);
        
        // Calculate total
        const total = cartItems.rows.reduce((sum, item) => {
            return sum + (item.price_at_time * item.quantity);
        }, 0);

        res.json({
            items: cartItems.rows,
            total: total
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});


// Update cart item quantity
router.put("/update/:id", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        const updatedItem = await pool.query(
            "UPDATE cart_items SET quantity = $1 WHERE id = $2 RETURNING *",
            [quantity, id]
        );

        if (updatedItem.rows.length === 0) {
            return res.status(404).json("Cart item not found");
        }

        res.json(updatedItem.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});


// Remove item from cart
router.delete("/remove/:id", authorization, async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedItem = await pool.query(
            "DELETE FROM cart_items WHERE id = $1 RETURNING *",
            [id]
        );

        if (deletedItem.rows.length === 0) {
            return res.status(404).json("Cart item not found");
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// Get recommended add-ons
router.get("/add-ons", authorization, async (req, res) => {
    try {
        const query = `
            SELECT 
                product_id,
                name,
                price,
                image_url
            FROM products
            WHERE is_addon = true
            AND is_active = true
            LIMIT 4
        `;

        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});


router.post("/checkout", authorization, async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('Checkout request body:', req.body);
        
        await client.query('BEGIN');

        // For online payments
        // server/routes/cart.js - modify the checkout handler
// Update the online payment section in the checkout route

// For online payments
if (req.body.payment_mode === 'online' && req.body.transaction_id) {
    // First check if an order with this transaction_id already exists
    const existingOrder = await client.query(
        'SELECT * FROM current_orders WHERE transaction_id = $1',
        [req.body.transaction_id]
    );

    if (existingOrder.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.json({
            success: true,
            order: existingOrder.rows[0],
            payment_status: 'completed'
        });
    }

    // Only proceed if cart items exist and total is greater than 0
    if (!req.body.cart_items || !req.body.cart_items.length || !req.body.total) {
        await client.query('ROLLBACK');
        return res.status(400).json({
            error: 'Invalid order data',
            payment_status: 'failed'
        });
    }

    const orderRes = await client.query(`
        INSERT INTO current_orders 
            (user_id, total, contact_phone, payment_mode, transaction_id, 
             items, admin_status, order_status, pickup_status)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'pending', 'pending')
        RETURNING *;
    `, [
        req.user,
        req.body.total,
        req.body.phone,
        'online',
        req.body.transaction_id,
        JSON.stringify(req.body.cart_items)
    ]);

    // Clear cart after successful order
    await client.query(`
        DELETE FROM cart_items 
        WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1);
    `, [req.user]);
    
    // Send WhatsApp notification for online payment
    try {
        const order = orderRes.rows[0];
        
        // Get user details
        const userRes = await client.query(
            'SELECT user_name FROM users WHERE user_id = $1',
            [req.user]
        );
        
        // Format items
        const itemsList = order.items
            .map(item => `  • ${item.name} x${item.quantity} - ₹${item.price_at_time * item.quantity}`)
            .join('\n');
        
        // Construct message
        const message = `🎂 Order Placed Successfully 🎂\n\n
        Hello ${userRes.rows[0].user_name},\n
        Your order has been placed successfully! Here are your order details:\n
        🔹 Order ID: ${order.order_id}\n
        🔹 Items:\n${itemsList}\n
        🔹 Total: ₹${order.total}\n
        🔹 Payment Method: Online (Completed)\n
        We are now processing your order. You'll receive updates once it is accepted.\n\n
        🍩 Bindi's Cupcakery 🍩\n📞 Contact: +918849130189`;
        
        // Send WhatsApp
        await req.app.get('twilioClient').messages.create({
            body: message,
            from: process.env.TWILIO_PHONE,
            to: `whatsapp:+91${order.contact_phone}`
        });
        
        console.log('WhatsApp notification sent for online payment');
    } catch (error) {
        console.error('WhatsApp notification failed for online payment:', error.message);
    }

    await client.query('COMMIT');
    return res.json({
        success: true,
        order: orderRes.rows[0],
        payment_status: 'completed'
    });
}

        // Regular checkout flow for non-online payments
        const orderRes = await client.query(`
            INSERT INTO current_orders 
                (user_id, items, total, contact_phone, payment_mode, 
                 admin_status, order_status, pickup_status)
            VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', 'pending')
            RETURNING *;
        `, [
            req.user,
            JSON.stringify(req.body.cart_items || []),
            req.body.total,
            req.body.phone,
            req.body.payment_mode
        ]);

        // Clear cart after successful order placement
        if (req.body.cart_items && req.body.cart_items.length > 0) {
            await client.query(`
                DELETE FROM cart_items 
                WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1);
            `, [req.user]);
        }

        await client.query('COMMIT');

        // WhatsApp notification logic
try {
    const order = orderRes.rows[0];
    
    // Get user details
    const userRes = await pool.query(
      'SELECT user_name FROM users WHERE user_id = $1',
      [req.user]
    );
    
    // Format items
    const itemsList = order.items
      .map(item => `  • ${item.name} x${item.quantity} - ₹${item.price * item.quantity}`)
      .join('\n');
  
    // Construct message
    const message = `🎂 Order Placed Successfully 🎂\n\n
    Hello ${userRes.rows[0].user_name},\n
    Your order has been placed successfully! Here are your order details:\n
    🔹 Order ID: ${order.order_id}\n
    🔹 Items:\n${itemsList}\n
    🔹 Total: ₹${order.total}\n
    We are now processing your order. You’ll receive updates once it is accepted.\n\n
    🍩 Bindi's Cupcakery 🍩\n📞 Contact: +918849130189`;
  
    // Send WhatsApp
    await req.app.get('twilioClient').messages.create({
      body: message,
      from: TWILIO_PHONE,
      to: `whatsapp:+91${order.contact_phone}`
    });
  } catch (error) {
    console.error('WhatsApp notification failed:', error.message);
  }
  

        res.json({
            success: true,
            order: orderRes.rows[0],
            payment_status: 'completed'
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Checkout error:", {
            error: err.message,
            stack: err.stack,
            body: req.body
        });
        res.status(500).json({ 
            error: err.message,
            payment_status: 'failed',
            details: 'Order creation failed'
        });
    } finally {
        client.release();
    }
});

module.exports = router;