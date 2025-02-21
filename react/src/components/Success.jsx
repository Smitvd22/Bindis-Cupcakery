// src/components/Success.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handlePaymentSuccess } from '../components/PaymentHandler';

const Success = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(10);
  const [isProcessing, setIsProcessing] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [orderDetails, setOrderDetails] = useState(null);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const processPayment = async () => {
      try {
        console.log('Processing payment, attempt:', retryCount + 1);
        console.log('Current localStorage state:', {
          pendingCartData: Object.keys(localStorage).filter(key => key.startsWith('pendingCartData_')),
          token: localStorage.getItem('token') ? 'exists' : 'missing'
        });

        const success = await handlePaymentSuccess();
        if (!success) {
          if (retryCount < MAX_RETRIES) {
            console.log(`Payment processing failed, retrying in 2 seconds (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
            }, 2000);
            return;
          }
          console.log('Max retries reached, redirecting to failure page');
          navigate('/failure');
          return;
        }

        console.log('Payment processing successful');
        setIsProcessing(false);

        // Extract transaction ID from URL to display
        const urlParams = new URLSearchParams(window.location.search);
        const transactionId = urlParams.get('transactionId');
        setOrderDetails({ transactionId });

        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Payment processing error:', error);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        } else {
          navigate('/failure');
        }
      }
    };

    if (isProcessing) {
      processPayment();
    }
  }, [navigate, retryCount, isProcessing]);

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment</h2>
            <p className="text-gray-600">
              Please wait while we confirm your payment...
              {retryCount > 0 && ` (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
          <p className="text-gray-600 mb-2">Your order has been placed successfully.</p>
          {orderDetails?.transactionId && (
            <p className="text-sm text-gray-500 mb-4">
              Transaction ID: {orderDetails.transactionId}
            </p>
          )}
          <p className="text-sm text-gray-600 mb-4">
            We've sent the order details to your phone via WhatsApp.
          </p>
          <p className="text-sm text-gray-500">Redirecting to homepage in {timeLeft} seconds...</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Home Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;