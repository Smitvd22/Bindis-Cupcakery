// import axios from "axios";

// export const handlePaymentSuccess = async () => {
//   try {
//     const urlParams = new URLSearchParams(window.location.search);
//     const transactionId = urlParams.get('transactionId');
    
//     console.log('Processing success for transaction:', transactionId);
    
//     if (!transactionId) {
//       throw new Error('No transaction ID found in URL');
//     }

//     console.log('Verifying payment...');
//     const verifyResponse = await axios.get(
//       `http://localhost:5000/verify-payment/${transactionId}`
//     );

//     console.log('Verification response:', verifyResponse.data);

//     if (!verifyResponse.data.success) {
//       throw new Error(`Payment verification failed: ${verifyResponse.data.message || 'Unknown error'}`);
//     }

//     // Attempt to get cart data but proceed even if missing
//     const pendingCartDataString = localStorage.getItem(`pendingCartData_${transactionId}`);
//     let orderData = {
//       transaction_id: transactionId,
//       payment_mode: 'online'
//     };

//     if (pendingCartDataString) {
//       const pendingCartData = JSON.parse(pendingCartDataString);
//       orderData = {
//         ...orderData,
//         total: pendingCartData.total,
//         phone: pendingCartData.phone,
//         cart_items: pendingCartData.cart.items,
//         hampers: pendingCartData.hampers
//       };
//     }

//     console.log('Placing order with data:', orderData);

//     const response = await fetch('http://localhost:5000/cart/checkout', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'token': localStorage.getItem('token')
//       },
//       body: JSON.stringify(orderData)
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(`Failed to place order: ${errorData.error || 'Unknown error'}`);
//     }

//     const orderResult = await response.json();
//     console.log('Order placed successfully:', orderResult);

//     localStorage.removeItem(`pendingCartData_${transactionId}`);
//     return true;
//   } catch (error) {
//     console.error('Payment success handling failed:', {
//       error: error.message,
//       stack: error.stack
//     });
//     return false;
//   }
// };
// src/components/PaymentHandler.js
import axios from 'axios';

export const handlePaymentSuccess = async () => {
  try {
    // Extract transaction ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');

    if (!transactionId) {
      console.error('No transaction ID found in URL');
      return false;
    }

    console.log('Processing payment success for transaction:', transactionId);

    // Step 1: Verify payment status with the backend
    const verifyResponse = await axios.get(`http://localhost:5000/verify-payment/${transactionId}`);

    if (!verifyResponse.data.success) {
      console.error('Payment verification failed:', verifyResponse.data);
      return false;
    }

    // Step 2: Retrieve pending cart data from localStorage
    const pendingCartKey = `pendingCartData_${transactionId}`;
    const pendingCartData = localStorage.getItem(pendingCartKey);
    let orderData = {
      transaction_id: transactionId,
      payment_mode: 'online',
    };

    if (pendingCartData) {
      const cartData = JSON.parse(pendingCartData);
      orderData = {
        ...orderData,
        total: cartData.total,
        phone: cartData.phone,
        cart_items: cartData.cart.items,
        hampers: cartData.hampers,
      };
    } else {
      console.warn('No pending cart data found for transaction:', transactionId);
    }

    // Step 3: Complete the checkout process
    const checkoutResponse = await axios.post(
      'http://localhost:5000/cart/checkout',
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token'),
        },
      }
    );

    if (!checkoutResponse.data.success) {
      console.error('Checkout failed:', checkoutResponse.data);
      return false;
    }

    // Step 4: Clean up localStorage
    localStorage.removeItem(pendingCartKey);

    // Step 5: Log success message
    console.log('Order processed successfully:', checkoutResponse.data);
    return true;
  } catch (error) {
    console.error('Error processing payment success:', error.message);
    return false;
  }
};