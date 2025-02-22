import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { useNavigate } from 'react-router-dom';
import { X, Package2, History } from 'lucide-react';

const UserProfileDialog = ({ isOpen, setIsOpen, userData, onLogout }) => {
  const navigate = useNavigate();
  const [orderHistory, setOrderHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const fetchOrderHistory = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
  
      const response = await fetch('http://localhost:5000/track/order-history', {
        headers: {
          'token': token
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="p-0 overflow-hidden bg-pink-100 max-w-md rounded-2xl border-none">
        {!showHistory ? (
          <div className="relative h-full w-full">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 z-10 text-gray-600 hover:text-gray-900"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col items-center pt-12 pb-6">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white overflow-hidden mb-4">
                <img
                  src="https://www.freeiconspng.com/uploads/am-a-19-year-old-multimedia-artist-student-from-manila--21.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {userData?.user_name}
                </h2>
                <p className="text-gray-600 mt-1">{userData?.user_email}</p>
                <p className="text-gray-600">{userData?.user_phone}</p>
              </div>
            </div>

            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={() => handleNavigation('/track-order')}
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl 
                          hover:bg-gray-50 transition-colors duration-200"
              >
                Track Order
              </button>
              
              <button
                onClick={fetchOrderHistory}
                className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl 
                          hover:bg-gray-50 transition-colors duration-200"
              >
                {isLoading ? 'Loading...' : 'View Order History'}
              </button>

              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-xl 
                          hover:bg-red-600 transition-colors duration-200 mt-6"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-semibold">Order History</h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {orderHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Package2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No Orders Yet</h3>
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderHistory
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .map((order) => (
                      <div key={order.order_id} className="border bg-white p-6 rounded-lg shadow-sm">
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
                                {order.order_status === 'rejected' ? 'Rejected' : 'Delivered'}
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
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileDialog;
