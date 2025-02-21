const express = require('express');
const app = express();
const cors = require('cors');  
const pool = require('./db'); // Your database connection
const auth = require('./middleware/authorization');
require('dotenv').config(); // Add at top
const twilio = require('twilio');
const axios = require('axios');
const bodyParser = require("body-parser");
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({extended: false}));
app.use(cors());
app.use(bodyParser.urlencoded({
  extended: false
}));

let salt_key = process.env.SALT_KEY
let merchant_id = process.env.MERCHANT_ID

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

app.set('twilioClient', TwilioClient); // Make available to routes

app.use('/track', require('./routes/orderTracking'));

app.post("/order", async (req, res) => {
  
  try {
      console.log(req.body)
      
      const merchantTransactionId = req.body.transactionId;
      const data = {
          merchantId: merchant_id,
          merchantTransactionId: merchantTransactionId,
          merchantUserId: req.body.MUID,
          name: req.body.name,
          amount: req.body.amount * 100,
          redirectUrl: `http://localhost:5000/status/?id=${merchantTransactionId}`,
          redirectMode: 'POST',
          mobileNumber: req.body.number,
          paymentInstrument: {
              type: 'PAY_PAGE'
            }
          };
          const payload = JSON.stringify(data);
      const payloadMain = Buffer.from(payload).toString('base64');
      const keyIndex = 1;
      const string = payloadMain + '/pg/v1/pay' + salt_key;
      const sha256 = crypto.createHash('sha256').update(string).digest('hex');
      const checksum = sha256 + '###' + keyIndex;
      
      // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
      const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
      
      const options = {
          method: 'POST',
          url: prod_URL,
          headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
              'X-VERIFY': checksum
            },
          data: {
            request: payloadMain
          }
        };
        
      axios.request(options).then(function (response) {
        console.log(response.data)

        return res.json(response.data)
      })
      .catch(function (error) {
              console.error(error);
            });
            
  } catch (error) {
      res.status(500).send({
        message: error.message,
          success: false
      })
    }
    
  })

app.post("/status", async (req, res) => {
  const merchantTransactionId = req.query.id;
  const merchantId = merchant_id;
  
  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = sha256 + "###" + keyIndex;

  try {
    const response = await axios({
      method: 'GET',
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': `${merchantId}`
      }
    });

    if (response.data.success === true) {
      // Include transaction ID in success redirect
      return res.redirect(`http://localhost:5173/success?transactionId=${merchantTransactionId}`);
    } else {
      // Include transaction ID in failure redirect too
      return res.redirect(`http://localhost:5173/failure?transactionId=${merchantTransactionId}`);
    }
  } catch (error) {
    console.error('Payment status check failed:', error);
    return res.redirect(`http://localhost:5173/failure?transactionId=${merchantTransactionId}`);
  }
});

// In server/index.js, add this endpoint if not already present
app.get('/verify-payment/:transactionId', async (req, res) => {
  const merchantTransactionId = req.params.transactionId;
  const merchantId = merchant_id;
  
  console.log('Verifying payment for transaction:', merchantTransactionId);
  
  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}${salt_key}`;
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  const checksum = `${sha256}###${keyIndex}`;

  try {
    console.log('Making request to PhonePe API...');
    const response = await axios.get(
      `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${merchantTransactionId}`,
      {
        headers: {
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': merchantId
        }
      }
    );

    console.log('PhonePe API Response:', response.data);

    // More detailed response checking
    if (!response.data) {
      throw new Error('No response data from PhonePe');
    }

    // Check for multiple possible success indicators
    const isSuccess = 
      response.data.code === 'PAYMENT_SUCCESS' || 
      response.data.success === true ||
      (response.data.data && response.data.data.responseCode === 'SUCCESS');

    console.log('Payment verification result:', { isSuccess });
    res.json({ 
      success: isSuccess,
      code: response.data.code,
      message: response.data.message
    });
  } catch (error) {
    console.error('Payment verification failed:', {
      error: error.message,
      stack: error.stack,
      transactionId: merchantTransactionId
    });
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Payment verification failed'
    });
  }
});

    app.listen(5000, () => {
  console.log('Server is running on port 5000');
});