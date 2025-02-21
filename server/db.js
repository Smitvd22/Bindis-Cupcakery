// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

// pool.query('SELECT NOW()', (err) => {
//   if (err) console.error('Database connection failed:', err);
//   else console.log('Database connected successfully');
// });

// module.exports = pool;

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use single connection string
  ssl: {
    rejectUnauthorized: false, // Required for Neon connections
  },
});

pool.query('SELECT NOW()', (err) => {
  if (err) console.error('Database connection failed:', err);
  else console.log('Database connected successfully');
});

module.exports = pool;
