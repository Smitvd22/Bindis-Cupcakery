// routes/cart.js
const router = require("express").Router();
const pool = require('../db');
const authorization = require("../middleware/authorization");

// // Add item to cart
// router.post("/add", authorization, async (req, res) => {
//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         console.log("Adding to cart for user_id:", req.user); // Debugging log
        
//         if (!req.user) {  // ✅ Use req.user instead of req.user_id
//             throw new Error("User ID is required");
//         }

//         const { product_id, quantity, price, customizations } = req.body;

//         // Get or create cart for user
//         let cartResult = await client.query(
//             'SELECT id FROM carts WHERE user_id = $1',
//             [req.user]  // ✅ Use req.user
//         );

//         let cart_id;
//         if (cartResult.rows.length === 0) {
//             console.log("Creating new cart for user:", req.user);
            
//             const newCartResult = await client.query(
//                 'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
//                 [req.user]  // ✅ Use req.user
//             );
//             cart_id = newCartResult.rows[0].id;
//         } else {
//             cart_id = cartResult.rows[0].id;
//         }

//         // Add item to cart
//         const cartItem = await client.query(
//             `INSERT INTO cart_items 
//             (cart_id, product_id, quantity, price_at_time, customizations) 
//             VALUES ($1, $2, $3, $4, $5) 
//             RETURNING id`,
//             [cart_id, product_id, quantity, price, JSON.stringify(customizations)]
//         );

//         await client.query('COMMIT');
//         res.json({ success: true, cart_item_id: cartItem.rows[0].id });
//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error("Cart addition error:", err.message);
//         res.status(500).json({ error: err.message });
//     } finally {
//         client.release();
//     }
// });

// // Add item to cart
// router.post("/add", authorization, async (req, res) => {
//     const client = await pool.connect();
//     try {
//         await client.query('BEGIN');

//         console.log("Adding to cart for user_id:", req.user);

//         if (!req.user) {
//             throw new Error("User ID is required");
//         }

//         const { product_id, quantity, price, customizations } = req.body;

//         // Get or create cart for user
//         let cartResult = await client.query(
//             'SELECT id FROM carts WHERE user_id = $1',
//             [req.user]
//         );

//         let cart_id;
//         if (cartResult.rows.length === 0) {
//             console.log("Creating new cart for user:", req.user);
//             const newCartResult = await client.query(
//                 'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
//                 [req.user]
//             );
//             cart_id = newCartResult.rows[0].id;
//         } else {
//             cart_id = cartResult.rows[0].id;
//         }

//         // Prepare customizations value (JSON string or NULL)
//         const customizationsValue = customizations !== undefined ? JSON.stringify(customizations) : null;

//         // Check for existing item with same product and customizations
//         const existingItem = await client.query(
//             `SELECT id, quantity FROM cart_items 
//              WHERE cart_id = $1 
//              AND product_id = $2 
//              AND customizations IS NOT DISTINCT FROM $3`,
//             [cart_id, product_id, customizationsValue]
//         );

//         let cartItem;
//         if (existingItem.rows.length > 0) {
//             // Update quantity of existing item
//             const newQuantity = existingItem.rows[0].quantity + quantity;
//             cartItem = await client.query(
//                 `UPDATE cart_items 
//                  SET quantity = $1 
//                  WHERE id = $2 
//                  RETURNING id`,
//                 [newQuantity, existingItem.rows[0].id]
//             );
//         } else {
//             // Insert new item
//             cartItem = await client.query(
//                 `INSERT INTO cart_items 
//                  (cart_id, product_id, quantity, price_at_time, customizations) 
//                  VALUES ($1, $2, $3, $4, $5) 
//                  RETURNING id`,
//                 [cart_id, product_id, quantity, price, customizationsValue]
//             );
//         }

//         await client.query('COMMIT');
//         res.json({ success: true, cart_item_id: cartItem.rows[0].id });
//     } catch (err) {
//         await client.query('ROLLBACK');
//         console.error("Cart addition error:", err.message);
//         res.status(500).json({ error: err.message });
//     } finally {
//         client.release();
//     }
// });

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
// // Remove item from cart
// router.delete("/remove/:itemId", authorization, async (req, res) => {
//     try {
//         const { itemId } = req.params;
//         const { user_id } = req;

//         const deleteQuery = `
//             DELETE FROM cart_items ci
//             USING carts c
//             WHERE ci.id = $1 
//             AND ci.cart_id = c.id 
//             AND c.user_id = $2
//         `;

//         const result = await pool.query(deleteQuery, [itemId, user_id]);

//         if (result.rowCount === 0) {
//             return res.status(404).json("Cart item not found");
//         }

//         res.json({ success: true });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json("Server Error");
//     }
// });

// // Get cart items
// router.get("/", authorization, async (req, res) => {
//     try {
//         const { user_id } = req;
//         const query = `
//             SELECT 
//                 ci.id as cart_item_id,
//                 ci.quantity,
//                 ci.price_at_time,
//                 ci.customizations,
//                 p.product_id,
//                 p.name,
//                 p.image_url,
//                 p.description
//             FROM cart_items ci
//             JOIN carts c ON ci.cart_id = c.id
//             JOIN products p ON ci.product_id = p.product_id
//             WHERE c.user_id = $1
//         `;

//         const result = await pool.query(query, [user_id]);
//         res.json(result.rows);
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json("Server Error");
//     }
// });

// router.get("/", authorization, async (req, res) => {
//     try {
//         const query = `
//             WITH cart_summary AS (
//                 SELECT 
//                     ci.id as cart_item_id,
//                     ci.quantity,
//                     ci.price_at_time,
//                     ci.customizations,
//                     p.product_id,
//                     p.name,
//                     p.image_url,
//                     p.description,
//                     p.category_id,
//                     (ci.quantity * ci.price_at_time) as item_total
//                 FROM cart_items ci
//                 JOIN carts c ON ci.cart_id = c.id
//                 JOIN products p ON ci.product_id = p.product_id
//                 WHERE c.user_id = $1
//             )
//             SELECT 
//                 *,
//                 (SELECT SUM(item_total) FROM cart_summary) as cart_total
//             FROM cart_summary
//         `;

//         const result = await pool.query(query, [req.user]);
        
//         // Format the response
//         const cartItems = result.rows;
//         const total = cartItems.length > 0 ? cartItems[0].cart_total : 0;

//         // res.json({
//         //     items: cartItems.map(item => ({
//         //         ...item,
//         //         customizations: item.customizations ? JSON.parse(item.customizations) : null
//         //     })),
//         //     total: total
//         // });

//         res.json({
//             items: cartItems.map(item => ({
//                 ...item,
//                customizations: typeof item.customizations === "string" ? JSON.parse(item.customizations) : item.customizations
//             })),
//             total: total
//         });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json("Server Error");
//     }
// });

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

// // Update cart item quantity
// router.put("/update/:itemId", authorization, async (req, res) => {
//     try {
//         const { itemId } = req.params;
//         const { quantity } = req.body;
        
//         if (quantity < 1) {
//             return res.status(400).json("Quantity must be at least 1");
//         }

//         const updateQuery = `
//             UPDATE cart_items ci
//             SET quantity = $1
//             FROM carts c
//             WHERE ci.id = $2 
//             AND ci.cart_id = c.id 
//             AND c.user_id = $3
//             RETURNING *
//         `;

//         const result = await pool.query(updateQuery, [quantity, itemId, req.user]);

//         if (result.rowCount === 0) {
//             return res.status(404).json("Cart item not found");
//         }

//         res.json({ success: true, updated_item: result.rows[0] });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json("Server Error");
//     }
// });

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

// // Remove item from cart
// router.delete("/remove/:itemId", authorization, async (req, res) => {
//     try {
//         const { itemId } = req.params;

//         const deleteQuery = `
//             DELETE FROM cart_items ci
//             USING carts c
//             WHERE ci.id = $1 
//             AND ci.cart_id = c.id 
//             AND c.user_id = $2
//             RETURNING *
//         `;

//         const result = await pool.query(deleteQuery, [itemId, req.user]);

//         if (result.rowCount === 0) {
//             return res.status(404).json("Cart item not found");
//         }

//         res.json({ success: true });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json("Server Error");
//     }
// });

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
        await client.query('BEGIN');

        const cartItemsQuery = `
            SELECT 
                ci.*,
                COALESCE(p.name, h.name) as name,
                COALESCE(p.image_url, h.image_url) as image_url,
                CASE 
                    WHEN ci.product_id IS NOT NULL THEN 'product'
                    ELSE 'hamper'
                END as item_type,
                u.user_email,
                u.user_name
            FROM cart_items ci
            JOIN carts c ON ci.cart_id = c.id
            LEFT JOIN products p ON ci.product_id = p.product_id
            LEFT JOIN hampers h ON ci.hamper_id = h.hamper_id
            JOIN users u ON c.user_id = u.user_id
            WHERE c.user_id = $1
        `;

        const cartRes = await client.query(cartItemsQuery, [req.user]);

        let allItems = [...cartRes.rows];
        if (req.body.hampers && req.body.hampers.length > 0) {
            allItems = [...allItems, ...req.body.hampers.map(hamper => ({
                ...hamper,
                item_type: 'hamper',
                price_at_time: hamper.price
            }))];
        }

        if (allItems.length === 0) {
            throw new Error('Cart is empty');
        }

        const orderRes = await client.query(`
            INSERT INTO current_orders 
                (user_id, items, total, contact_phone, pickup_status, payment_mode)
            VALUES ($1, $2, $3, $4, 'pending', $5)
            RETURNING *;
        `, [
            req.user,
            JSON.stringify(allItems.map(item => ({
                product_id: item.product_id,
                hamper_id: item.hamper_id,
                name: item.name,
                quantity: item.quantity,
                price: item.price_at_time,
                customizations: item.customizations,
                item_type: item.item_type
            }))),
            req.body.total,
            req.body.phone,
            req.body.payment_mode
        ]);

        await client.query(`
            DELETE FROM cart_items 
            WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1);
        `, [req.user]);

        await client.query('COMMIT');

        res.json({
            success: true,
            order: orderRes.rows[0],
            payment_status: 'completed'
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Checkout error:", err.message);
        res.status(500).json({ 
            error: err.message,
            payment_status: 'failed'
        });
    } finally {
        client.release();
    }
});
module.exports = router;