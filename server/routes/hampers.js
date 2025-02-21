const router = require("express").Router();
const pool = require('../db');

// Get all hampers
router.get("/", async (req, res) => {
    try {
        const hampersQuery = `
            SELECT 
                hamper_id,
                name,
                description,
                price,
                image_url,
                is_bestseller,
                rating,
                review_count,
                contents,
                packaging_type,
                occasion,
                delivery_time
            FROM hampers
            WHERE is_active = true
            ORDER BY created_at DESC;
        `;
        const result = await pool.query(hampersQuery);
        // Map hamper_id to id for frontend compatibility
        const hampers = result.rows.map(hamper => ({
            id: hamper.hamper_id,  // Map hamper_id to id
            ...hamper
        }));
        res.json(hampers);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

// Get specific hamper details
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const hamperQuery = `
            SELECT 
                hamper_id,
                name,
                description,
                price,
                image_url,
                is_bestseller,
                rating,
                review_count,
                contents,
                packaging_type,
                occasion,
                delivery_time
            FROM hampers
            WHERE hamper_id = $1 AND is_active = true;
        `;
        const result = await pool.query(hamperQuery, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json("Hamper not found");
        }
        
        // Map hamper_id to id for frontend compatibility
        const hamper = {
            id: result.rows[0].hamper_id,  // Map hamper_id to id
            ...result.rows[0]
        };
        
        res.json(hamper);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.get("/search", async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.json([]);
      }
  
      const searchQuery = `
        SELECT 
          hamper_id,
          name,
          description,
          price,
          image_url,
          is_bestseller,
          rating,
          review_count,
          contents,
          packaging_type,
          occasion,
          delivery_time,
          hamper_type
        FROM hampers
        WHERE 
          is_active = true 
          AND (
            LOWER(name) LIKE LOWER($1)
            OR LOWER(COALESCE(description, '')) LIKE LOWER($1)
            OR LOWER(COALESCE(occasion, '')) LIKE LOWER($1)
            OR LOWER(COALESCE(packaging_type, '')) LIKE LOWER($1)
            OR LOWER(COALESCE(hamper_type, '')) LIKE LOWER($1)
            OR EXISTS (
              SELECT 1
              FROM jsonb_array_elements(contents) AS content
              WHERE LOWER(content->>'item') LIKE LOWER($1)
            )
          )
        ORDER BY 
          CASE WHEN LOWER(name) LIKE LOWER($1) THEN 0
               WHEN LOWER(description) LIKE LOWER($1) THEN 1
               ELSE 2
          END,
          created_at DESC;
      `;
  
      const result = await pool.query(searchQuery, [`%${query}%`]);
      
      // Map hamper_id to id for frontend compatibility
      const hampers = result.rows.map(hamper => ({
        id: hamper.hamper_id,
        ...hamper
      }));
      
      res.json(hampers);
    } catch (err) {
      console.error(err.message);
      res.status(500).json("Server Error");
    }
  });
  
// Get random similar hampers
router.get("/random/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const randomHampersQuery = `
            SELECT 
                hamper_id,
                name,
                description,
                price,
                image_url,
                rating,
                review_count,
                delivery_time
            FROM hampers
            WHERE hamper_id != $1 
            AND is_active = true
            ORDER BY RANDOM()
            LIMIT 8;
        `;
        const result = await pool.query(randomHampersQuery, [id]);
        // Map hamper_id to id for frontend compatibility
        const hampers = result.rows.map(hamper => ({
            id: hamper.hamper_id,
            ...hamper
        }));
        res.json(hampers);
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;