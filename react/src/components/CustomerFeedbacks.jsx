import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Filter } from 'lucide-react';
import axios from 'axios';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const CustomerFeedbacks = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, homepage, not-homepage

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.adminReviews));
      const sortedReviews = response.data.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setReviews(sortedReviews);
      setFilteredReviews(sortedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to load reviews');
    }
  };

  const toggleHomepageDisplay = async (reviewId) => {
    try {
      // Update the endpoint to use the correct path
      const response = await axios.patch(getApiUrl(API_ENDPOINTS.reviewToggleHomepage(reviewId)));
      
      if (response.data) {
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.review_id === reviewId
              ? { ...review, display_on_homepage: !review.display_on_homepage }
              : review
          )
        );
        // Refresh reviews after toggling
        fetchReviews();
      }
    } catch (error) {
      console.error('Toggle homepage error:', error);
      setError(
        error.response?.data?.error || 
        'Failed to update review status. Maximum 5 reviews can be displayed on homepage.'
      );
      
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  useEffect(() => {
    if (filter === 'homepage') {
      setFilteredReviews(reviews.filter((review) => review.display_on_homepage));
    } else if (filter === 'not-homepage') {
      setFilteredReviews(reviews.filter((review) => !review.display_on_homepage));
    } else {
      setFilteredReviews(reviews);
    }
  }, [filter, reviews]);

  return (
    <div className="p-6 w-full h-full min-h-screen flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Customer Feedbacks</h2>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            className="border rounded-md px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Reviews</option>
            <option value="homepage">On Homepage</option>
            <option value="not-homepage">Not on Homepage</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer" onClick={() => setError(null)}>
            ×
          </span>
        </div>
      )}

      {/* Fixed Scrollable Container */}
      <div className="flex-grow overflow-y-auto h-[calc(100vh-120px)] space-y-6">
        {filteredReviews.map((review) => (
          <div key={review.review_id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{review.user_name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{review.product_name}</span>
                </div>
                <div className="flex items-center mt-2">{renderStars(review.rating)}</div>
              </div>
              <button
                onClick={() => toggleHomepageDisplay(review.review_id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                  review.display_on_homepage ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{review.display_on_homepage ? 'On Homepage' : 'Add to Homepage'}</span>
              </button>
            </div>
            <p className="mt-4 text-gray-700">{review.comment}</p>
            <div className="mt-2 text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerFeedbacks;
