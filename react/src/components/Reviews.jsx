import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";
import axios from "axios";
import { getApiUrl, API_ENDPOINTS } from '../config/api';

export default function Reviews() {
  const [showAll, setShowAll] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomepageReviews = async () => {
      try {
        const response = await axios.get(getApiUrl(API_ENDPOINTS.reviewHomepage));
        const formattedReviews = response.data.map(review => ({
          id: review.review_id,
          name: review.user_name,
          rating: review.rating,
          text: review.comment,
          productName: review.product_name,
          date: new Date(review.created_at).toLocaleDateString()
        }));
        setReviews(formattedReviews);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
        setLoading(false);
      }
    };

    fetchHomepageReviews();
  }, []);

  if (loading) return <div className="text-center py-8">Loading reviews...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  const displayedReviews = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-8">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{review.name}</h3>
                  <p className="text-sm text-gray-500">{review.productName}</p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600">{review.text}</p>
              <p className="text-sm text-gray-500 mt-2">{review.date}</p>
            </div>
          ))}
        </div>
        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <button
              onClick={() => setShowAll(!showAll)}
              className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700"
            >
              {showAll ? 'Show Less' : 'See All Reviews'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}