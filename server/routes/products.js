const router = require("express").Router();
const pool = require('../db');

// Fetch bestsellers and new additions for home page
router.get("/home", async (req, res) => {
    try {
        // Updated bestsellers query to match your schema
        const bestsellersQuery = `
            SELECT 
                product_id as id,
                name,
                description,
                price,
                image_url,
                rating,
                review_count,
                is_bestseller
            FROM products
            WHERE is_active = true 
            AND is_bestseller = true
            ORDER BY review_count DESC NULLS LAST
            LIMIT 10
        `;
        
        // Updated new additions query
        const newAdditionsQuery = `
            SELECT 
                product_id as id,
                name,
                description,
                price,
                image_url,
                rating,
                review_count,
                is_bestseller
            FROM products
            WHERE is_active = true
            ORDER BY created_at DESC
            LIMIT 10
        `;
        
        const [bestsellers, newAdditions] = await Promise.all([
            pool.query(bestsellersQuery),
            pool.query(newAdditionsQuery)
        ]);

        // Add debug logging
        console.log('Bestsellers count:', bestsellers.rows.length);
        console.log('New additions count:', newAdditions.rows.length);
        
        res.json({
            bestsellers: bestsellers.rows,
            newAdditions: newAdditions.rows
        });
    } catch (err) {
        console.error('Database Error:', err.message);
        // Send a more detailed error response
        res.status(500).json({ 
            error: "Server Error", 
            details: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                c.description as category_description
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id = $1 AND p.is_active = true
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json("Product not found");
        }
        
        const product = result.rows[0];
        
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// In your products.js route file
router.get("/random/:productId", async (req, res) => {
    try {
        const { productId } = req.params;
        const query = `
            SELECT 
                p.*,
                c.name as category_name
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE p.product_id != $1 
            AND p.is_active = true
            ORDER BY RANDOM()
            LIMIT 8
        `;
        
        const result = await pool.query(query, [productId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// Fetch products by category name
router.get("/category/:categoryName", async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { sort = 'popularity' } = req.query;

        let orderByClause;
        switch (sort) {
            case 'price_low':
                orderByClause = 'p.price ASC';
                break;
            case 'price_high':
                orderByClause = 'p.price DESC';
                break;
            case 'rating':
                orderByClause = 'p.rating DESC';
                break;
            case 'popularity':
            default:
                orderByClause = 'p.review_count DESC';
                break;
        }

        const query = `
            SELECT 
                p.product_id as id,
                p.name,
                p.description,
                p.price,
                p.image_url,
                p.rating,
                p.review_count,
                p.is_bestseller,
                c.name as category_name,
                c.category_id
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE LOWER(c.name) = LOWER($1)
            AND p.is_active = true
            ORDER BY ${orderByClause}
        `;
        
        const result = await pool.query(query, [categoryName]);
        
        if (result.rows.length === 0) {
            return res.status(404).json("No products found in this category");
        }

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
