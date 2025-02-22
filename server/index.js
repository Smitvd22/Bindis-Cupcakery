const express = require('express');
const app = express();
const cors = require('cors');  
const pool = require('./db'); // Your database connection
const auth = require('./middleware/authorization');
require('dotenv').config(); // Add at top
const twilio = require('twilio');
const axios = require('axios');
const bodyParser = require("body-parser");

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({extended: false}));
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(bodyParser.urlencoded({
  extended: false
}));


const TwilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const whatsappRoutes = require("./routes/whatsapp");
app.use("/api/whatsapp", whatsappRoutes);


// routes
// register and login routes
app.use('/auth', require('./routes/jwtAuth'));
app.use("/dashboard", require("./routes/dashboard")); 
// app.use("/categories", require("./routes/categories"));
app.use("/orders", require("./routes/orders"));
app.use("/products", require("./routes/products"));
app.use("/cart", require("./routes/cart"));
app.use('/admin', require('./routes/admin'));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/hampers", require("./routes/hampers"));
app.use('/payment', require('./routes/payment'));

app.set('twilioClient', TwilioClient); // Make available to routes

app.use('/track', require('./routes/orderTracking'));

  app.listen(5000, () => {
  console.log('Server is running on port 5000');
});