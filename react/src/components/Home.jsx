import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReviewDialog from './ReviewDialog';
import HeroCarousel from "./HeroCarousel";
import CategoryNav from "./CategoryNav";
import ProductSection from "./ProductSection";
import AboutUs from "./AboutUs";
import Reviews from "./Reviews";
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const Home = () => {
  const [pendingReview, setPendingReview] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);
  const [products, setProducts] = useState({
    bestsellers: [],
    newAdditions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkPendingReviews();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      // Update the endpoint URL to include /products
      const response = await axios.get(getApiUrl(API_ENDPOINTS.homeProducts)); // Add the base URL
      
      console.log('Products response:', response.data);
      
      // Add validation to ensure we have the expected data structure
      if (response.data && (response.data.bestsellers || response.data.newAdditions)) {
        setProducts({
          bestsellers: response.data.bestsellers || [],
          newAdditions: response.data.newAdditions || []
        });
      } else {
        throw new Error('Invalid data structure received from server');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(
        err.response?.data?.error || 
        err.message || 
        'Failed to fetch products'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkPendingReviews = async () => {
    try {
      const response = await axios.get('/api/orders/pending-reviews');
      if (response.data.length > 0) {
        setPendingReview(response.data[0]);
      }
    } catch (error) {
      console.error('Error checking pending reviews:', error);
    }
  };

  const handleReviewSubmit = () => {
    setPendingReview(null);
    setShowThankYou(true);
    setTimeout(() => setShowThankYou(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-grow">
        <HeroCarousel />
        
        <div className="relative z-10">
          <CategoryNav />
        </div>
        
        <div className="relative z-20 -mt-8">
          <ProductSection
            title="Our Bestsellers"
            products={products.bestsellers}
            loading={loading}
            error={error}
          />
        </div>
        
        <div className="relative z-20 -mt-8">
          <ProductSection
            title="New Additions"
            products={products.newAdditions}
            loading={loading}
            error={error}
          />
        </div>
        
        <div className="relative z-20 -mt-8">
          <AboutUs />
        </div>
        
        <div className="relative z-20 -mt-8">
          <Reviews />
        </div>
      </main>

      {pendingReview && (
        <ReviewDialog
          order={pendingReview}
          onClose={() => setPendingReview(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
      
      {showThankYou && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
          Thank you for your review!
        </div>
      )}
    </div>
  );
};

export default Home;