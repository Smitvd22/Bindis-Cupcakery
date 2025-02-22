import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

export const handlePaymentSuccess = async () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');

    if (!transactionId) {
      console.error('No transaction ID found in URL');
      return false;
    }

    console.log('Processing payment success for transaction:', transactionId);

    // Verify payment status
    const verifyResponse = await axios.get(getApiUrl(API_ENDPOINTS.paymentVerify(transactionId)));
    console.log('Payment verification response:', verifyResponse.data);

    if (!verifyResponse.data.success) {
      console.error('Payment verification failed:', verifyResponse.data);
      return false;
    }

    // Get cart data
    const pendingCartKey = `pendingCartData_${transactionId}`;
    const pendingCartData = localStorage.getItem(pendingCartKey);
    
    if (!pendingCartData) {
      console.error('No pending cart data found for transaction:', transactionId);
      return false;
    }

    const cartData = JSON.parse(pendingCartData);
    const orderData = {
      transaction_id: transactionId,
      payment_mode: 'online',
      total: cartData.total,
      phone: cartData.phone,
      cart_items: cartData.cart.items,
      hampers: cartData.hampers,
    };

    // Complete checkout
    const checkoutResponse = await axios.post(getApiUrl(API_ENDPOINTS.cart + '/checkout'),
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token'),
        },
      }
    );

    console.log('Checkout response:', checkoutResponse.data);

    if (!checkoutResponse.data.success) {
      console.error('Checkout failed:', checkoutResponse.data);
      return false;
    }

    localStorage.removeItem(pendingCartKey);
    return true;
  } catch (error) {
    console.error('Error processing payment success:', error);
    return false;
  }
};