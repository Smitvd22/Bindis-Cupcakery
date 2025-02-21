import React, { useState } from 'react';
import axios from 'axios';

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

const CheckoutDialog2 = ({ isOpen, onClose, cart, hampers, onPaymentComplete }) => {
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [paymentMode, setPaymentMode] = useState(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [localCart, setLocalCart] = useState(null);
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [responseId, setResponseId] = useState("");
  const [responseState, setResponseState] = useState([]);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");

      script.src = src;

      script.onload = () => {
        resolve(true)
      }
      script.onerror = () => {
        resolve(false)
      }

      document.body.appendChild(script);
    })
  }

  const createRazorpayOrder = (amount) => {
    let data = JSON.stringify({
      amount: amount * 100,
      currency: "INR"
    })

    let config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "http://localhost:5000/order",
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    }

    axios.request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data))
      handleRazorpayScreen(response.data.amount)
    })
    .catch((error) => {
      console.log("error at", error)
    })
  }

  const handleRazorpayScreen = async(amount) => {
    const res = await loadScript("https:/checkout.razorpay.com/v1/checkout.js")

    if (!res) {
      alert("Some error at razorpay screen loading")
      return;
    }

    const options = {
      key: 'rzp_test_rsGhm1tjactFuG',
      amount: amount,
      currency: 'INR',
      name: "papaya coders",
      description: "payment to papaya coders",
      image: "https://papayacoders.com/demo.png",
      handler: function (response){
        setResponseId(response.razorpay_payment_id)
      },
      prefill: {
        name: "papaya coders",
        email: "papayacoders@gmail.com"
      },
      theme: {
        color: "#F4C430"
      }
    }

    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  const paymentFetch = (e) => {
    e.preventDefault();

    const paymentId = e.target.paymentId.value;

    axios.get(`http://localhost:5000/payment/${paymentId}`)
    .then((response) => {
      console.log(response.data);
      setResponseState(response.data)
    })
    .catch((error) => {
      console.log("error occures", error)
    })
  }

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
    setShowQRDialog(true);
    setFormErrors({});
  };

  const handlePayment = async (mode) => {
    const errors = validatePhone();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
  
    try {
      setPaymentStatus('processing');
      setLocalCart(cart);
  
      const checkoutData = {
        total: cart.total,
        phone: phone,
        cart_items: cart.items,
        hampers: hampers,
        payment_mode: mode
      };

      const response = await fetch('http://localhost:5000/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
        },
        body: JSON.stringify(checkoutData)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Checkout failed');
      }
  
      const data = await response.json();
      
      if (data.payment_status === 'completed') {
        setPaymentStatus('completed');
        onPaymentComplete();
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
          >
            Pay on Takeaway
          </Button>
          <Button 
            onClick={() => createRazorpayOrder(100)}
            className="w-full bg-green-600"
          >
            Pay Online
          </Button>
          {responseId && <p>{responseId}</p>}
          <h1>This is payment verification form</h1>
          <form onSubmit={paymentFetch}>
            <input type="text" name="paymentId" />
            <button type="submit">Fetch Payment</button>
            {responseState.length !==0 && (
            <ul>
                <li>Amount: {responseState.amount / 100} Rs.</li>
                <li>Currency: {responseState.currency}</li>
                <li>Status: {responseState.status}</li>
                <li>Method: {responseState.method}</li>
            </ul>
            )}
        </form>
        </div>
      </div>
    </div>
  );

  const QRDialog = () => (
    <div className="space-y-4">
      <div className="flex justify-center">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
          alt="Payment QR Code"
          className="border rounded-lg"
        />
      </div>
      {paymentMode === 'takeaway' ? (
        <div className="text-center">
          <p>Order placed. To confirm your order, please discuss with the owner for acceptance.</p>
          <Button 
            onClick={() => handlePayment('takeaway')}
            className="w-full mt-4"
          >
            Confirm Order
          </Button>
        </div>
      ) : (
        <Button 
          onClick={() => handlePayment('online')}
          className="w-full"
        >
          Pay ₹ {calculateTotal()}
        </Button>
      )}
    </div>
  );

  const amount = 500;
  const currency = "INR";
  const receiptId = "qwsaq1";

  const paymentHandler = async (e) => {
    if (e) e.preventDefault();  // Move this to the top
    
    try {
      // Calculate amount in paise
      const amountInPaise = amount * 100;
      
      // Create order
      const response = await fetch("http://localhost:5000/order", {
        method: "POST",
        body: JSON.stringify({
          amount: amountInPaise,  // Make sure this is in paise
          currency: "INR",
          receipt: receiptId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to create order');
      }
  
      const orderData = await response.json();
      console.log("Order created:", orderData);
  
      var options = {
        key: "rzp_test_8svjQ1m4bXekV2", // Store key in environment variable
        amount: amountInPaise,
        currency: "INR",
        name: "Neutrons",
        description: "Test Transaction",
        image: "https://cdn.vectorstock.com/i/500p/17/37/atom-logo-icon-vector-53611737.jpg",
        order_id: orderData.id, // Use the id from the order response
        handler: function (response) {
          console.log("Payment successful");
          console.log("Payment ID:", response.razorpay_payment_id);
          console.log("Order ID:", response.razorpay_order_id);
          console.log("Signature:", response.razorpay_signature);
          // Handle successful payment (update your database, show success message, etc.)
        },
        prefill: {
          name: "The Analyzer",
          email: "whatever@example.com",
          contact: "9000090000"
        },
        notes: {
          address: "Razorpay Corporate Office"
        },
        theme: {
          color: "#3399cc"
        }
      };
  
      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response) {
        console.error("Payment failed:", response.error);
        // Show a more user-friendly error message
        alert(`Payment failed: ${response.error.description}`);
      });
  
      rzp1.open();
    } catch (error) {
      console.error("Error in payment handler:", error);
      alert("Could not process payment. Please try again.");
    }
  };

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

export default CheckoutDialog2;