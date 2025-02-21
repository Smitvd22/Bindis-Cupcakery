import React, { useState, useEffect } from 'react';
import { Package2, History, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const TimelineStep = ({ active, completed, children, animate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center mb-8 ${
        completed ? 'text-green-500' : active ? 'text-blue-500' : 'text-gray-400'
      }`}
    >
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
          ${completed ? 'border-green-500 bg-green-50' : 
            active ? 'border-blue-500 bg-blue-50' : 
            'border-gray-300'}`}
        >
          {completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <div className={`w-3 h-3 rounded-full ${active ? 'bg-blue-500' : 'bg-gray-300'}`} />
          )}
        </div>
        <div className={`h-full ml-4 ${
          completed ? 'text-green-500' : active ? 'text-blue-500' : 'text-gray-500'
        }`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
};

const TrackOrder = () => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const navigate = useNavigate();

  // In the useEffect for fetching current order
useEffect(() => {
    const fetchCurrentOrder = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
  
        const response = await fetch('http://localhost:5000/track/current-order', {
          headers: {
            'token': token  // Changed from 'Authorization' to match your auth setup
          }
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch order');
        }
  
        const data = await response.json();
        setCurrentOrder(data);
      } catch (error) {
        console.error('Error fetching current order:', error);
      }
    };
  
    // Set up polling for order status updates
    const intervalId = setInterval(fetchCurrentOrder, 30000); // Poll every 30 seconds
    fetchCurrentOrder();
  
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate]); // Add navigate to dependencies
  
  // Update fetchOrderHistory
  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await fetch('http://localhost:5000/track/order-history', {
        headers: {
          'token': token  // Changed from 'Authorization' to match your auth setup
        }
      });
  
      if (!response.ok) {
        if (response.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch order history');
      }
  
      const data = await response.json();
      setOrderHistory(data);
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  if (!currentOrder && !showHistory) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
          <Package2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Active Orders</h2>
          <p className="text-gray-500 mb-6">You don't have any active orders at the moment.</p>
          <div className="flex justify-center gap-4">
            <Link to="/orders" className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors">
              Place an Order
            </Link>
            <button
              onClick={fetchOrderHistory}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              <History className="w-5 h-5" />
              View Order History
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showHistory) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-semibold">Order History</h2>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">            
            <div className="space-y-4">
              {orderHistory
                .filter(order => {
                  if (orderFilter === 'all') return true;
                  return order.order_status === orderFilter;
                })
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .map((order) => (
                  <div key={order.order_id} className="border p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">Order #{order.order_id}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="mt-2">
                          <p className="text-gray-600">
                            Total: ${parseFloat(order.total).toFixed(2)}
                          </p>
                          <span className={`inline-block px-2 py-1 rounded-full text-sm ${
                            order.order_status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {order.order_status === 'rejected' ? order.order_status : 'Delivered'}
                          </span>
                        
                        </div>
                        {order.rejection_reason && (
                          <p className="mt-2 text-sm text-red-600">
                            <strong>Reason:</strong> {order.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-700">
                Order #{currentOrder.order_id}
              </h2>
              <p className="text-gray-500">
                Placed on {new Date(currentOrder.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={fetchOrderHistory}
              className="flex items-center gap-2 text-pink-500 hover:text-pink-600"
            >
              <History className="w-5 h-5" />
              Order History
            </button>
          </div>

          <div className="space-y-6">
  <AnimatePresence>
    <TimelineStep 
      completed={currentOrder.admin_status !== 'pending'}
      active={currentOrder.admin_status === 'pending'}
    >
      <h3 className="font-semibold">Order Received</h3>
      <p className="text-sm">We've received your order and it's being reviewed</p>
    </TimelineStep>

    {currentOrder.admin_status === 'rejected' ? (
      <TimelineStep active={true}>
        <div className="flex items-center gap-2 text-red-500">
          <XCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Order Rejected</h3>
            <p className="text-sm">{currentOrder.rejection_reason || 'Order cannot be fulfilled at this time'}</p>
          </div>
        </div>
      </TimelineStep>
    ) : (
      <>
        <TimelineStep 
          completed={currentOrder.pickup_status !== 'pending' || currentOrder.ready_for_pickup}
          active={currentOrder.admin_status === 'accepted' && currentOrder.pickup_status === 'pending'}
        >
          <h3 className="font-semibold">Order Confirmed</h3>
          <p className="text-sm">
            {currentOrder.accepted_at 
              ? `Confirmed at ${new Date(currentOrder.accepted_at).toLocaleTimeString()}`
              : 'Waiting for confirmation'}
          </p>
        </TimelineStep>

        <TimelineStep 
          completed={currentOrder.pickup_status === 'picked_up'}
          active={currentOrder.ready_for_pickup || currentOrder.pickup_status === 'ready_for_pickup'}
        >
          <h3 className="font-semibold">Ready for Pickup</h3>
          <p className="text-sm">
            {currentOrder.ready_at
              ? `Ready since ${new Date(currentOrder.ready_at).toLocaleTimeString()}`
              : currentOrder.pickup_status === 'preparing' ? 'Your order has been prepared' : 'Preparing your order'}
          </p>
        </TimelineStep>

        {currentOrder.pickup_status === 'picked_up' && (
          <TimelineStep completed={true}>
            <h3 className="font-semibold">Order Completed</h3>
            <p className="text-sm">Thank you for ordering!</p>
          </TimelineStep>
        )}
      </>
    )}
  </AnimatePresence>
</div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;