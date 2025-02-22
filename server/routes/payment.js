const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');

// Get environment variables
const salt_key = process.env.SALT_KEY;
const merchant_id = process.env.MERCHANT_ID;

// Payment initiation endpoint
router.post("/initiate", async (req, res) => {
  try {
    console.log(req.body);
    
    const merchantTransactionId = req.body.transactionId;
    const data = {
      merchantId: merchant_id,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100,
      redirectUrl: `http://localhost:5000/payment/status/?id=${merchantTransactionId}`,
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
    
    const prod_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    
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
    
    const response = await axios.request(options);
    return res.json(response.data);
    
  } catch (error) {
    console.error('Payment initiation failed:', error);
    res.status(500).send({
      message: error.message,
      success: false
    });
  }
});

// Payment status endpoint
router.post("/status", async (req, res) => {
  const merchantTransactionId = req.query.id;
  const merchantId = merchant_id;
  
  try {
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    console.log('Checking payment status for transaction:', merchantTransactionId);

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

    console.log('PhonePe status response:', response.data);

    // Enhanced success check
    const isSuccess = 
      response.data.success === true && (
        response.data.code === 'PAYMENT_SUCCESS' ||
        response.data.data?.state === 'COMPLETED' ||
        response.data.data?.responseCode === 'SUCCESS'
      );

    if (isSuccess) {
      console.log('Payment successful, redirecting to success page');
      return res.redirect(`http://localhost:5173/success?transactionId=${merchantTransactionId}`);
    } else {
      console.log('Payment unsuccessful:', response.data);
      return res.redirect(`http://localhost:5173/failure?transactionId=${merchantTransactionId}&reason=${encodeURIComponent(response.data.message || 'Payment failed')}`);
    }
  } catch (error) {
    console.error('Payment status check failed:', error);
    return res.redirect(`http://localhost:5173/failure?transactionId=${merchantTransactionId}&error=${encodeURIComponent(error.message)}`);
  }
});

// Payment verification endpoint
router.get("/verify/:transactionId", async (req, res) => {
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

    if (!response.data) {
      throw new Error('No response data from PhonePe');
    }

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

module.exports = router;