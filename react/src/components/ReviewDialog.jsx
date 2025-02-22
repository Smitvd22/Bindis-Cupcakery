import { useState } from "react";
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const ReviewDialog = ({ review, userId, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSkip = async () => {
    try {
      await fetch(getApiUrl(`${API_ENDPOINTS.reviews}/mark-shown`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.token}`
        },
        body: JSON.stringify({ reviewId: review.id })
      });
      onClose();
    } catch (error) {
      console.error("Error marking review as shown:", error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating!");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.reviewSubmit), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.token}`
        },
        body: JSON.stringify({
          userId,
          productId: review.product_id,
          orderId: review.order_id,
          rating,
          comment,
          reviewId: review.id
        })
      });
  
      if (!response.ok) {
        throw new Error("Failed to submit review");
      }
  
      const data = await response.json();
      if (data.success) {
        onSubmitSuccess();
        onClose();
      } else {
        throw new Error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      setError(error.message || "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!review) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Rate Your Purchase</h2>
        <p className="text-gray-600 mb-4">How was your experience with <b>{review.product_name}</b>?</p>

        <div className="flex justify-center mb-3">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => setRating(num)}
              className={`mx-1 text-2xl ${num <= rating ? "text-yellow-500" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          className="w-full p-2 border rounded-md mb-3"
          rows="3"
          placeholder="Write a review (optional)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <button 
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            Maybe Later
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDialog;