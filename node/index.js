// import pg from "pg";
// import express from "express";
// import bodyParser from "body-parser";
// import dotenv from "dotenv";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import cors from "cors";
// import { authenticate } from "./authMiddleware.js";

// dotenv.config();

// const { Client } = pg;

// const client = new Client({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

// client.connect()
//   .then(() => console.log('Connected to PostgreSQL'))
//   .catch(err => console.error('Connection error', err.stack));

// // Use Express and the middleware to parse the POST method:
// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.get("/api", (req, res) => res.send("Hello World!"));

// //Finally, add a port that will expose the API when the server is running. Here, we expose it on port 3000.
// app.listen(3000, () => console.log(`App running on port 3000.`));

// // This code is a complete Express.js API server that:

// // Sets up a web server using Express
// // Creates API endpoints (/api, /api/all, /api/form)
// // Maintains an ongoing database connection for handling requests
// // Uses middleware (body-parser) to handle POST requests
// // Creates a users table and provides endpoints to interact with it