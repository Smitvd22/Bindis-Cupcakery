// import pg from 'pg';
// const { Client } = pg;

// const client = new Client({
//   host: 'localhost',
//   user: 'postgres',
//   password: 'postgres',
//   database: 'gwoc',
//   port: 5432,
// });

// // Step 3: Connect to the database
// client.connect()
//   .then(() => console.log('Connected to PostgreSQL'))
//   .catch(err => console.error('Connection error', err.stack));

// // Step 4: Query the database
// client.query('SELECT * FROM demo', (err, res) => {
//   if (err) {
//     console.error('Error executing query', err.stack);
//   } else {
//     console.log('Query results:', res.rows);
//   }

//   // Step 5: Close the connection
//   client.end();
// });