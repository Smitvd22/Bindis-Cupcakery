import React, { useState } from 'react';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const CurrentOrders = ({ currentOrders = [], setCurrentOrders, isAcceptingOrders, toggleOrderAcceptance }) => {
  const [rejectionDialog, setRejectionDialog] = useState({ open: false, orderId: null });
  const [rejectionReason, setRejectionReason] = useState("");

  const handleOrderStatus = async (orderId, status, rejectionReason = null) => {
    try {
      const response = await axios.put(
        getApiUrl(API_ENDPOINTS.orderStatus(orderId)),
        { status, rejection_reason: rejectionReason }
      );
      
      if (status === 'accepted') {
        setCurrentOrders(prev => 
          prev.map(order => 
            order.order_id === orderId ? { ...order, order_status: 'accepted' } : order
          )
        );
      } else {
        setCurrentOrders(prev => 
          prev.filter(order => order.order_id !== orderId)
        );
      }
      
      // Show WhatsApp status notification
      alert(response.data.whatsappStatus);
      
    } catch (error) {
      console.error(`Error ${status === 'accepted' ? 'accepting' : 'rejecting'} order:`, error);
      alert(`Failed to ${status === 'accepted' ? 'accept' : 'reject'} order. WhatsApp message not sent.`);
    }
  };

  const acceptOrder = async (orderId) => {
    await handleOrderStatus(orderId, 'accepted');
  };

  const handleReject = (orderId) => {
    setRejectionDialog({ open: true, orderId });
  };

  const confirmReject = async () => {
    try {
      await handleOrderStatus(rejectionDialog.orderId, 'rejected', rejectionReason);
      setRejectionDialog({ open: false, orderId: null });
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting order:", error);
      alert("Failed to reject order");
    }
  };

  const toggleReadyStatus = async (orderId) => {
    try {
      const response = await axios.put(
        getApiUrl(API_ENDPOINTS.pickupStatus(orderId))
      );
      
      setCurrentOrders(prev => 
        prev.map(order => 
          order.order_id === orderId ? { ...order, ...response.data } : order
        )
      );

      // Show WhatsApp status notification if included in response
      if (response.data.whatsappStatus) {
        alert(response.data.whatsappStatus);
      }
    } catch (error) {
      console.error("Error updating ready status:", error);
      alert("Failed to update ready status");
    }
  };

  const markAsPickedUp = async (orderId) => {
    try {
      const response = await axios.put(
        getApiUrl(API_ENDPOINTS.orderPickup(orderId))
      );
      setCurrentOrders(prev => prev.filter(order => order.order_id !== orderId));
      
      // Show WhatsApp status notification if included in response
      if (response.data.whatsappStatus) {
        alert(response.data.whatsappStatus);
      }
    } catch (error) {
      console.error("Error marking as picked up:", error);
      alert("Failed to mark as picked up");
    }
  };

  return (
    <div className="p-6 flex flex-col items-center h-full">
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
          <div className="space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
            {currentOrders.map((order) => (
              <div key={order.order_id} className="border p-6 rounded-lg shadow-md">
                <div className="mb-4">
                  <p><strong>Order ID:</strong> {order.order_id}</p>
                  <p><strong>User:</strong> {order.user_name} ({order.contact_phone})</p>
                  <p><strong>Total:</strong> ${Number(order.total).toFixed(2)}</p>
                  <p><strong>Items:</strong></p>
                  <ul className="list-disc pl-5">
                    {order.items.map((item, index) => (
                      <li key={index}>{item.name} (x{item.quantity})</li>
                    ))}
                  </ul>
                </div>

                {order.order_status === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => acceptOrder(order.order_id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Accept Order
                    </button>
                    <button
                      onClick={() => handleReject(order.order_id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject Order
                    </button>
                  </div>
                )}

                {order.order_status === 'accepted' && (
                  <div className="space-y-4">
                    <p className="text-green-500 font-semibold">Order in the making</p>
                    <button
                      onClick={() => toggleReadyStatus(order.order_id)}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                      Mark as Ready for Pickup
                    </button>
                  </div>
                )}

                {order.order_status === 'ready_for_pickup' && (
                  <div className="space-y-4">
                    <p className="text-green-500 font-semibold">Ready for pickup</p>
                    <button
                      onClick={() => markAsPickedUp(order.order_id)}
                      className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Mark as Picked Up
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={rejectionDialog.open} onOpenChange={() => setRejectionDialog({ open: false, orderId: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this order:
              <textarea
                className="w-full mt-2 p-2 border rounded"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-red-500 hover:bg-red-600">
              Confirm Rejection
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CurrentOrders;