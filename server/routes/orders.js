const router = require("express").Router();
const pool = require('../db');

router.get("/", async (req, res) => {
    try {
        const categoriesQuery = `
            WITH RankedProducts AS (
                SELECT 
                    p.*,
                    c.name as category_name,
                    c.description as category_description,
                    ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.created_at DESC) as rn
                FROM products p
                JOIN categories c ON p.category_id = c.category_id
                WHERE p.is_active = true
            )
            SELECT 
                category_id,
                category_name,
                category_description,
                json_agg(
                    json_build_object(
                        'id', product_id,
                        'name', name,
                        'price', price,
                        'rating', rating,
                        'review_count', review_count,
                        'image_url', image_url
                    )
                ) as products
            FROM RankedProducts
            WHERE rn <= 4
            GROUP BY category_id, category_name, category_description
            ORDER BY category_id;
        `;

        const result = await pool.query(categoriesQuery);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.get("/search", async (req, res) => {
    try {
      const { query } = req.query;
      
      // If no search query provided, return empty results
      if (!query) {
        return res.json([]);
      }
  
      const searchQuery = `
        WITH SearchResults AS (
          SELECT 
            p.*,
            c.name as category_name,
            c.description as category_description
          FROM products p
          JOIN categories c ON p.category_id = c.category_id
          WHERE 
            p.is_active = true 
            AND (
              LOWER(p.name) LIKE LOWER($1)
              OR LOWER(p.description) LIKE LOWER($1)
              OR LOWER(c.name) LIKE LOWER($1)
            )
        )
        SELECT 
          category_id,
          category_name,
          category_description,
          json_agg(
            json_build_object(
              'id', product_id,
              'name', name,
              'price', price,
              'rating', rating,
              'review_count', review_count,
              'image_url', image_url
            )
          ) as products
        FROM SearchResults
        GROUP BY category_id, category_name, category_description
        ORDER BY category_id;
      `;
  
      const result = await pool.query(searchQuery, [`%${query}%`]);
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  });

module.exports = router;