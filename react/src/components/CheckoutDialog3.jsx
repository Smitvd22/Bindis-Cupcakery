import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

// Dialog Component (unchanged)
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-md bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const DialogHeader = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold text-gray-900">
    {children}
  </h2>
);

const DialogFooter = ({ children }) => (
  <div className="mt-6 flex justify-end gap-3">
    {children}
  </div>
);

const Button = ({ children, className = "", ...props }) => (
  <button
    className={`px-4 py-2 rounded-md font-medium transition-colors
      ${className.includes('w-full') ? 'w-full' : ''}
      ${className.includes('bg-') ? className : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
    {...props}
  >
    {children}
  </button>
);

const CheckoutDialog3 = ({ isOpen, onClose, cart, hampers, onPaymentComplete }) => {
    const [paymentStatus, setPaymentStatus] = useState('pending');
    const [paymentMode, setPaymentMode] = useState(null);
    const [showQRDialog, setShowQRDialog] = useState(false);
    const [localCart, setLocalCart] = useState(null);
    const [phone, setPhone] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
  
    const validatePhone = () => {
      const errors = {};
      if (!phone || !phone.match(/^\+?[1-9]\d{1,14}$/)) {
        errors.phone = 'Valid phone number required';
        return errors;
      }
      return {};
    };
  
    const handlePaymentModeSelect = (mode) => {
      const errors = validatePhone();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setPaymentMode(mode);
      if (mode === 'online') {
        setIsProcessing(true);
        initiateOnlinePayment();
      } else {
        setShowQRDialog(true);
      }
      setFormErrors({});
    };
  
    // Inside CheckoutDialog3 component, update the initiateOnlinePayment function:
    // In CheckoutDialog3.jsx, update the initiateOnlinePayment function:
const initiateOnlinePayment = async () => {
  const total = calculateTotal();
  const transactionId = 'T' + Date.now();
  
  const paymentData = {
    name: 'Customer',
    amount: total,
    number: phone,
    MUID: "MUID" + Date.now(),
    transactionId: transactionId,
    cart_items: cart.items // Add cart items to payment data
  };

  try {
    // Save cart data with transaction ID
    const cartData = {
      cart,
      hampers,
      phone,
      total,
      transactionId,
      timestamp: Date.now()
    };
    
    console.log('Saving cart data with transaction ID:', transactionId);
    localStorage.setItem(`pendingCartData_${transactionId}`, JSON.stringify(cartData));

    const response = await axios.post(getApiUrl(API_ENDPOINTS.paymentInitiate), paymentData);
    
    if (response.data && response.data.data.instrumentResponse.redirectInfo.url) {
      // Show redirect dialog
      const redirectUrl = response.data.data.instrumentResponse.redirectInfo.url;
      
      // Create and show the redirect dialog
      const dialogContent = document.createElement('div');
      dialogContent.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg text-center">
            <p class="mb-4">Redirecting you to the payment page...</p>
            <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
          </div>
        </div>
      `;
      document.body.appendChild(dialogContent);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
    }
  } catch (error) {
    console.error('Payment initiation error:', error);
    localStorage.removeItem(`pendingCartData_${transactionId}`);
    alert('Failed to initiate payment. Please try again.');
    setIsProcessing(false);
  }
};

    const handleTakeawayPayment = async () => {
      const errors = validatePhone();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
    
      try {
        setPaymentStatus('processing');
        setLocalCart(cart);
    
        const checkoutData = {
          total: calculateTotal(),
          phone: phone,
          cart_items: cart.items,
          hampers: hampers,
          payment_mode: 'takeaway'
        };
  
        const response = await fetch(getApiUrl(API_ENDPOINTS.cart + '/checkout'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'token': localStorage.getItem('token')
          },
          body: JSON.stringify(checkoutData)
        });
    
        if (!response.ok) {
          throw new Error('Checkout failed');
        }
    
        const data = await response.json();
        
        if (data.payment_status === 'completed') {
          setPaymentStatus('completed');
          onPaymentComplete();
          
          // Show WhatsApp notification status
          if (data.whatsappStatus) {
            alert(data.whatsappStatus);
          }
        }
        
      } catch (error) {
        console.error('Payment error:', error);
        setPaymentStatus('pending');
        setShowQRDialog(false);
        alert('Checkout failed: ' + error.message);
      }
    };

  const calculateTotal = () => {
    const cartTotal = cart.total || 0;
    const hampersTotal = hampers?.reduce((sum, hamper) => sum + (hamper.price * hamper.quantity), 0) || 0;
    return cartTotal + hampersTotal;
  };

  const PaymentOptionsDialog = () => (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 space-y-2">
        <h3 className="font-medium">Choose Payment Method</h3>
        <div className="space-y-3">
          <Button 
            onClick={() => handlePaymentModeSelect('takeaway')}
            className="w-full bg-blue-600"
            disabled={isProcessing}
          >
            Pay on Takeaway
          </Button>
          <Button 
            onClick={() => handlePaymentModeSelect('online')}
            className="w-full bg-green-600"
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay Online'}
          </Button>
        </div>
      </div>
    </div>
  );

  const QRDialog = () => (
    <div className="space-y-4">
      <div className="text-center p-4">
        <p>Confirm your takeaway order</p>
        <Button 
          onClick={handleTakeawayPayment}
          className="w-full mt-4"
        >
          Place Order - ₹{calculateTotal()}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentStatus === 'completed' ? 'Order Placed!' : 'Complete Your Order'}
          </DialogTitle>
        </DialogHeader>
        
        {paymentStatus === 'pending' && !showQRDialog && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  className="w-full px-3 py-2 border rounded-md"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm">{formErrors.phone}</p>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">Order Summary</h3>
              {cart.items?.map(item => (
                <div key={item.cart_item_id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹ {item.price_at_time * item.quantity}</span>
                </div>
              ))}
              
              {hampers?.map(hamper => (
                <div key={hamper.hamper_id} className="flex justify-between text-sm">
                  <span>{hamper.name} (Hamper) x {hamper.quantity}</span>
                  <span>₹ {hamper.price * hamper.quantity}</span>
                </div>
              ))}
              
              <div className="border-t pt-2 font-medium flex justify-between">
                <span>Total Amount</span>
                <span>₹ {calculateTotal()}</span>
              </div>
            </div>
            
            <PaymentOptionsDialog />
          </div>
        )}
        
        {paymentStatus === 'pending' && showQRDialog && <QRDialog />}
        
        {paymentStatus === 'processing' && (
          <div className="py-8 text-center">
            <p>Processing your payment...</p>
          </div>
        )}
        
        {paymentStatus === 'completed' && (
          <div className="space-y-4">
            <div className="text-center text-green-600">
              <p>Your order has been placed successfully!</p>
              <p className="text-sm text-gray-600 mt-2">
                Order ID: #{localCart?.order_id || 'N/A'}
              </p>
              <p className="text-sm mt-2">
                We'll contact you at {phone} for delivery updates
              </p>
            </div>
            
            <div className="border rounded-lg p-4 space-y-2">
              <h3 className="font-medium">Invoice</h3>
              {localCart?.items?.map(item => (
                <div key={item.cart_item_id} className="flex justify-between text-sm">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹ {item.price_at_time * item.quantity}</span>
                </div>
              ))}
              
              {hampers?.map(hamper => (
                <div key={hamper.hamper_id} className="flex justify-between text-sm">
                  <span>{hamper.name} (Hamper) x {hamper.quantity}</span>
                  <span>₹ {hamper.price * hamper.quantity}</span>
                </div>
              ))}
              
              <div className="border-t pt-2 font-medium flex justify-between">
                <span>Total Paid</span>
                <span>₹ {calculateTotal()}</span>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {paymentStatus === 'completed' && (
            <Button 
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog3;