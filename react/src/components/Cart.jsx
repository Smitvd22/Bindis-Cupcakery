import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CheckoutDialog3 from './CheckoutDialog3';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

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
      const response = await fetch(getApiUrl(API_ENDPOINTS.cart), {
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
      const response = await fetch(getApiUrl(API_ENDPOINTS.cart + '/add-ons'), {
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
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.cart}/update/${itemId}`), {
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
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.cart}/remove/${itemId}`), {
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
      const response = await fetch(getApiUrl(API_ENDPOINTS.cart + '/add'), {
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
    <div className="min-h-screen bg-pink-50">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Order Acceptance Banner */}
        {!isAcceptingOrders && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p className="text-sm sm:text-base">
              We're currently not accepting orders. Any existing cart items will be saved for later.
            </p>
          </div>
        )}

        {/* Cart Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items Container */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Your Cart</h2>
              
              {cartData.items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Your cart is empty</div>
              ) : (
                <div className="space-y-4">
                  {cartData.items.map(item => (
                    <div key={item.id} className="flex flex-col sm:flex-row items-start gap-4 py-4 border-t">
                      <img 
                        src={item.image_url || "/api/placeholder/80/80"}
                        alt={item.name}
                        className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-lg mx-auto sm:mx-0"
                      />
                      <div className="flex-1 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            {item.customizations?.weight && (
                              <p className="text-sm text-gray-500">Weight: {item.customizations.weight}</p>
                            )}
                          </div>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <p className="font-medium text-lg">₹ {(item.price_at_time * item.quantity).toFixed(2)}</p>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center border rounded-md"
                              aria-label="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center border rounded-md"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add-ons Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Your last minute add-ons</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {addOns.map((item) => (
                  <div key={item.product_id} className="flex flex-col items-center">
                    <img 
                      src={item.image_url || "/api/placeholder/160/160"}
                      alt={item.name}
                      className="w-full aspect-square object-cover rounded-lg mb-2"
                      loading="lazy"
                    />
                    <h3 className="text-sm font-medium text-center">{item.name}</h3>
                    <p className="text-sm text-gray-600">₹ {item.price}</p>
                    <button 
                      onClick={() => addToCart(item.product_id, item.price)}
                      className="mt-2 w-full py-2 px-4 text-sm text-blue-600 border border-blue-600 
                               rounded-md hover:bg-blue-50 transition-colors duration-200"
                    >
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bill Summary Section */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="border-b pb-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-semibold">Bill Summary</h2>
                  <span className="text-gray-600">{cartData.items.length} Items</span>
                </div>
              </div>
              <div className="pt-4 space-y-4">
                <div className="flex justify-between text-base sm:text-lg">
                  <span className="text-gray-600">Item Total</span>
                  <span className="font-medium">₹ {cartData.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg sm:text-xl">
                  <span>Grand Total</span>
                  <span>₹ {cartData.total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  className={`w-full py-3 rounded-md text-base sm:text-lg font-medium 
                           transition-colors duration-200 ${
                    isAcceptingOrders && cartData.items.length > 0
                      ? "bg-blue-600 text-white hover:bg-blue-700"
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
      </div>

      {/* Checkout Dialog */}
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