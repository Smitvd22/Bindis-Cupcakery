import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Home, ClipboardList, History, Settings, MessageSquare, LogOut } from "lucide-react";
import CustomizeMenu from "./CustomizeMenu";
import CustomerFeedbacks from "./CustomerFeedbacks";
import axios from "axios";
import DashboardContent from "./DashboardContent";
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const tabs = [
  { name: "Dashboard", icon: Home },
  { name: "Current Orders", icon: ClipboardList },
  { name: "Order History", icon: History },
  { name: "Customize Menu", icon: Settings },
  { name: "Customer Feedbacks", icon: MessageSquare },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("adminActiveTab") || "Dashboard"
  );
  const [currentOrders, setCurrentOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState(() => {
    const savedHistory = localStorage.getItem('orderHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(
    localStorage.getItem("acceptingOrders") !== "false"
  );
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  // Common rejection reasons
  const commonReasons = [
    "Out of ingredients",
    "Kitchen at full capacity",
    "Store closing soon",
    "Technical issues",
    "Other"
  ];

  const handleAcceptClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowAcceptConfirm(true);
  };

  const handleRejectClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowRejectDialog(true);
    setRejectionReason("");
  };

  const confirmAcceptOrder = async () => {
    if (selectedOrderId) {
      await handleOrderStatus(selectedOrderId, 'accepted');
      setShowAcceptConfirm(false);
      setSelectedOrderId(null);
    }
  };

  const confirmRejectOrder = async () => {
    if (selectedOrderId && rejectionReason.trim()) {
      try {
        await axios.put(getApiUrl(API_ENDPOINTS.orderStatus(selectedOrderId)), {
          status: 'rejected',
          rejection_reason: rejectionReason
        });
        
        setCurrentOrders(currentOrders.filter(order => order.order_id !== selectedOrderId));
        setShowRejectDialog(false);
        setSelectedOrderId(null);
        setRejectionReason("");
        
        fetchCurrentOrders();
      } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to reject order. Please try again.');
      }
    }
  };

  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('orderHistory');
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    navigate('/admin/login');
  };

  const toggleOrderAcceptance = () => {
    const newStatus = !isAcceptingOrders;
    setIsAcceptingOrders(newStatus);
    localStorage.setItem("acceptingOrders", newStatus);
    window.dispatchEvent(new Event("orderAcceptanceChanged"));
  };

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
    const interval = setInterval(() => {
      if (activeTab === "Current Orders") fetchCurrentOrders();
      if (activeTab === "Order History") fetchOrderHistory();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "Current Orders") fetchCurrentOrders();
    if (activeTab === "Order History") fetchOrderHistory();
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);

  const fetchCurrentOrders = async () => {
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.currentOrders));
      setCurrentOrders(response.data);
    } catch (error) {
      console.error("Error fetching current orders:", error);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.orderHistory));
      const history = response.data;
      setOrderHistory(history);
      localStorage.setItem('orderHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Error fetching order history:", error);
    }
  };

  const handleOrderStatus = async (orderId, status) => {
    try {
      await axios.put(getApiUrl(API_ENDPOINTS.orderStatus(orderId)), { status });
      
      if (status === 'accepted') {
        setCurrentOrders(currentOrders.map(order => 
          order.order_id === orderId 
            ? { ...order, admin_status: 'accepted', pickup_status: 'preparing' }
            : order
        ));
      } else if (status === 'rejected') {
        setCurrentOrders(currentOrders.filter(order => order.order_id !== orderId));
      }
      
      fetchCurrentOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handlePickupStatus = async (orderId) => {
    try {
      const response = await axios.put(getApiUrl(API_ENDPOINTS.pickupStatus(orderId)));
      
      setCurrentOrders(currentOrders.map(order => 
        order.order_id === orderId 
          ? { ...order, pickup_status: response.data.new_status }
          : order
      ));
    } catch (error) {
      console.error('Error updating pickup status:', error);
      alert('Failed to update pickup status. Please try again.');
    }
  };

  const markAsPickedUp = async (orderId) => {
    try {
      const response = await axios.put(getApiUrl(API_ENDPOINTS.orderPickup(orderId)));
  
      if (response.data.order) {
        setCurrentOrders(prev => prev.filter(order => order.order_id !== orderId));
        setOrderHistory(prev => [
          {
            ...response.data.order,
            picked_up_at: new Date().toISOString(),
            reviewed: false,
            review_request_sent: false
          },
          ...prev
        ]);
  
        alert("Order marked as picked up successfully!");
      }
    } catch (error) {
      console.error("Error marking order as picked up:", error);
      alert('Failed to mark order as picked up. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent />;
        case "Current Orders":
          return (
            <div className="p-6 flex flex-col bg-pink-50 items-center h-full">
              <div className="w-full max-w-6xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Current Orders</h2>
                  <button
                    onClick={toggleOrderAcceptance}
                    className={`px-4 py-2 rounded transition-colors ${
                      isAcceptingOrders
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                  >
                    {isAcceptingOrders ? "Accepting Orders" : "Not Accepting Orders"}
                  </button>
                </div>
                {currentOrders.length === 0 ? (
                  <div className="text-center text-gray-500 h-full flex items-center justify-center">
                    <p className="text-xl">No current orders right now</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto bg-white rounded-lg">
                    {currentOrders.map((order) => (
                      <div key={order.order_id} className="border p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p><strong>Order ID:</strong> {order.order_id}</p>
                            <p><strong>User:</strong> {order.user_name} ({order.contact_phone})</p>
                            <p><strong>Total:</strong> ₹{order.total ? Number(order.total).toFixed(2) : "0.00"}</p>
                            <p><strong>Payment Mode:</strong> {order.payment_mode === 'online' ? 'Paid Online' : 'Pay on Takeaway'}</p>
                          </div>
                          {order.admin_status === 'pending' && (
                            <div className="space-x-2">
                              <button
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                onClick={() => handleAcceptClick(order.order_id)}
                              >
                                Accept Order
                              </button>
                              <button
                                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                onClick={() => handleRejectClick(order.order_id)}
                              >
                                Reject Order
                              </button>
                            </div>
                          )}
                        </div>
  
                        {order.admin_status === 'accepted' && (
                          <div className="mt-4">
                            <p className="text-green-600 font-medium mb-2">Order in the making</p>
                            <div className="space-y-2">
                              <button
                                className={`w-full px-4 py-2 rounded transition-colors ${
                                  order.pickup_status === 'ready_for_pickup'
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                                onClick={() => handlePickupStatus(order.order_id)}
                              >
                                {order.pickup_status === 'ready_for_pickup' 
                                  ? 'Order is ready for pickup'
                                  : 'Mark order ready for pickup'}
                              </button>
                              
                              {order.pickup_status === 'ready_for_pickup' && (
                                <button
                                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                                  onClick={() => markAsPickedUp(order.order_id)}
                                >
                                  Mark as Picked Up
                                </button>
                              )}
                            </div>
                          </div>
                        )}
  
                        <div className="mt-4">
                          <p><strong>Items:</strong></p>
                          <ul className="list-disc list-inside">
                            {order.items.map((item, index) => (
                              <li key={index}>{item.name} (x{item.quantity})</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
          case "Order History":
            return (
              <div className="p-6 flex flex-col bg-pink-50 items-center h-full">
                <div className="w-full max-w-6xl">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Order History</h2>
                    {/* Dropdown for filtering orders */}
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="all">All Orders</option>
                      <option value="completed">Completed</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Display Orders Based on Filter */}
                  {orderHistory.length === 0 ? (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center">
                      <p className="text-xl">No order history available</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto bg-white rounded-lg">
                      {orderHistory
                      .filter((order) => {
                        if (orderFilter === "all") return true;
                        if (orderFilter === "completed") return order.admin_status !== "rejected";
                        return order.admin_status === "rejected";
                      })
                      .sort((a, b) => {
                        const dateA = new Date(a.picked_up_at || a.rejected_at);
                        const dateB = new Date(b.picked_up_at || b.rejected_at);
                        return dateB - dateA; // Sort in descending order (most recent first)
                      })
                      .map((order) => (
                        <div key={order.order_id} className="border p-6 rounded-lg shadow-md">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p><strong>Order ID:</strong> {order.order_id}</p>
                              <p><strong>User:</strong> {order.user_name} ({order.contact_phone})</p>
                              <p><strong>Total:</strong> ₹{order.total ? Number(order.total).toFixed(2) : "0.00"}</p>
                              <p><strong>Payment Mode:</strong> {order.payment_mode === "online" ? "Paid Online" : "Pay on Takeaway"}</p>
                              <p><strong>Status:</strong> 
                                <span className={order.admin_status === "rejected" ? "text-red-600" : "text-green-600"}>
                                  {order.admin_status === "rejected" ? " Rejected" : " Completed"}
                                </span>
                              </p>
                              {order.admin_status === "rejected" && (
                                <p><strong>Rejection Reason:</strong> {order.rejection_reason || "N/A"}</p>
                              )}
                              <p><strong>Picked Up At:</strong> {order.picked_up_at ? new Date(order.picked_up_at).toLocaleString() : new Date(order.rejected_at).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
      case "Customize Menu":
        return <CustomizeMenu />;
      case "Customer Feedbacks":
        return <CustomerFeedbacks />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-[#f0adbc] text-black flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <img
              src="/images/Logo.png"
              alt="Bindi's Cupcakery"
              className="h-12 w-12 object-contain"
            />
            <img
              src="/images/Name.png"
              alt="Bindi's Cupcakery"
              className="h-8 object-contain"
            />
          </div>
          <p className="text-sm text-black">
            {new Date().toLocaleDateString()} <br />
            {new Date().toLocaleTimeString()}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`flex items-center space-x-3 p-3 w-full rounded-md transition ${activeTab === tab.name ? "bg-gray-200" : "hover:bg-gray-200"
                }`}
              onClick={() => setActiveTab(tab.name)}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
              {adminName.charAt(0)}
            </div>
            <span className="font-medium">{adminName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 p-3 w-full rounded-md hover:bg-gray-400 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <div className="h-full bg-white shadow-md rounded-lg overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      {/* Accept Order Confirmation Modal */}
      {showAcceptConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Order Acceptance</h3>
            <p className="mb-4">Are you sure you want to accept this order?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowAcceptConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={confirmAcceptOrder}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Order Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Order</h3>
            <p className="mb-2">Please select or specify a reason for rejection:</p>
            
            <div className="space-y-2 mb-4">
              {commonReasons.map((reason) => (
                <button
                  key={reason}
                  className={`w-full p-2 text-left rounded ${
                    rejectionReason === reason 
                      ? 'bg-red-100 border-red-500 border' 
                      : 'hover:bg-gray-100 border border-gray-200'
                  }`}
                  onClick={() => setRejectionReason(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>
            
            {rejectionReason === "Other" && (
              <textarea
                className="w-full p-2 border rounded mb-4"
                placeholder="Please specify the reason..."
                value={rejectionReason === "Other" ? "" : rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows="3"
              />
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={confirmRejectOrder}
                disabled={!rejectionReason.trim()}
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-4">Confirm Logout</h3>
            <p className="mb-4">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;