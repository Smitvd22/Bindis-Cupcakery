import { useState } from "react";

const ReviewDialog = ({ review, userId, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSkip = async () => {
    try {
      await fetch("http://localhost:5000/api/reviews/mark-shown", {
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
      alert("Please select a rating!");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Submit review AND mark as shown in single request
      const response = await fetch("http://localhost:5000/api/reviews/submit", {
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
          reviewId: review.id // Add review ID to request
        })
      });
  
      if (!response.ok) throw new Error("Failed to submit review");
  
      onSubmitSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
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