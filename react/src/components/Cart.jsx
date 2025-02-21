import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CheckoutDialog from './CheckoutDialog';
import CheckoutDialog2 from './CheckoutDialog2';
import CheckoutDialog3 from './CheckoutDialog3';

const Cart = () => {
  const [cartData, setCartData] = useState({ items: [], total: 0 });
  const [addOns, setAddOns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const status = localStorage.getItem("acceptingOrders") !== "false";
    setIsAcceptingOrders(status);
    
    const handler = () => {
      setIsAcceptingOrders(localStorage.getItem("acceptingOrders") !== "false");
    };
    
    window.addEventListener("orderAcceptanceChanged", handler);
    return () => window.removeEventListener("orderAcceptanceChanged", handler);
  }, []);

  useEffect(() => {
    fetchCartData();
    fetchAddOns();
  }, []);

  const fetchCartData = async () => {
    try {
      const response = await fetch('http://localhost:5000/cart', {
        headers: {
          'token': localStorage.getItem('token')
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      
      // Handle both array and object responses
      if (Array.isArray(data)) {
        // If server returns array, calculate total here
        const total = data.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);
        setCartData({
          items: data,
          total: total
        });
      } else {
        // If server returns object with items and total
        setCartData({
          items: data.items || [],
          total: data.total || 0
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddOns = async () => {
    try {
      const response = await fetch('http://localhost:5000/cart/add-ons', {
        headers: {
          'token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAddOns(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch add-ons:', err);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const response = await fetch(`http://localhost:5000/cart/update/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (response.ok) {
        fetchCartData();
      }
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch(`http://localhost:5000/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers: {
          'token': localStorage.getItem('token')
        }
      });

      if (response.ok) {
        fetchCartData();
      }
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const addToCart = async (productId, price) => {
    try {
      const response = await fetch('http://localhost:5000/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': localStorage.getItem('token')
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
          price: price
        })
      });

      if (response.ok) {
        fetchCartData();
      }
    } catch (err) {
      console.error('Failed to add item:', err);
    }
  };
  
  const handlePaymentComplete = () => {
    fetchCartData();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 p-4 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-pink-50 p-4 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-4 md:p-8">
      {!isAcceptingOrders && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          We're currently not accepting orders. Any existing cart items will be saved for later.
        </div>
      )}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Cart</h2>
            
            {cartData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Your cart is empty</div>
            ) : (
              cartData.items.map(item => (
                <div key={item.id} className="flex items-start gap-4 py-4 border-t">
                  <img 
                    src={item.image_url || "/api/placeholder/80/80"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        {item.customizations?.weight && (
                          <p className="text-sm text-gray-500">Weight: {item.customizations.weight}</p>
                        )}
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-medium">₹ {(item.price_at_time * item.quantity).toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-md"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border rounded-md"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Add-ons Section */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your last minute add-ons</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {addOns.map((item) => (
                <div key={item.product_id} className="text-center">
                  <img 
                    src={item.image_url || "/api/placeholder/160/160"}
                    alt={item.name}
                    className="w-full aspect-square object-cover rounded-lg mb-2"
                  />
                  <h3 className="text-sm font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-600">₹ {item.price}</p>
                  <button 
                    onClick={() => addToCart(item.product_id, item.price)}
                    className="mt-2 w-full py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bill Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="border-b pb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Bill Summary</h2>
                <span className="text-gray-600">{cartData.items.length} Items</span>
              </div>
            </div>
            <div className="pt-4 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Item Total</span>
                <span className="font-medium">₹ {cartData.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Grand Total</span>
                <span>₹ {cartData.total.toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                className={`w-full py-3 rounded-md transition-colors ${
                  isAcceptingOrders && cartData.items.length > 0
                    ? "bg-blue-700 text-white hover:bg-blue-800"
                    : "bg-gray-400 text-gray-700 cursor-not-allowed"
                }`}
                disabled={!isAcceptingOrders || cartData.items.length === 0}
              >
                {isAcceptingOrders ? "PLACE ORDER" : "ORDERS PAUSED"}
              </button>
            </div>
          </div>
        </div>
      </div>
      <CheckoutDialog3 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cartData}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};
export default Cart;