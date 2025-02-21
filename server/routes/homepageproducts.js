import { pool } from '../db'; // Assuming you have database connection setup

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get bestsellers
    const bestsellersQuery = `
      SELECT *
      FROM products
      WHERE is_active = true AND is_bestseller = true
      ORDER BY rating DESC
      LIMIT 8
    `;

    // Get new additions (products created in the last 30 days)
    const newAdditionsQuery = `
      SELECT *
      FROM products
      WHERE is_active = true 
      AND created_at > NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 8
    `;

    const [bestsellers, newAdditions] = await Promise.all([
      pool.query(bestsellersQuery),
      pool.query(newAdditionsQuery)
    ]);

    return res.status(200).json({
      bestsellers: bestsellers.rows,
      newAdditions: newAdditions.rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}