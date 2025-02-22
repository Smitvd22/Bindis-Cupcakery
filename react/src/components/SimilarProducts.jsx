import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const SimilarProducts = ({ currentProductId }) => {
  const [randomProducts, setRandomProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchRandomProducts();
  }, [currentProductId]);

  const fetchRandomProducts = async () => {
    try {
      // Updated endpoint to fetch random products
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.products}/random/${currentProductId}`));
      if (!response.ok) {
        throw new Error('Failed to fetch random products');
      }
      const data = await response.json();
      setRandomProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      // Initial check
      checkScrollability();
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
    };
  }, [randomProducts]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const cardWidth = 280; // width of each card
      const gap = 16; // space between cards
      const scrollAmount = (cardWidth + gap) * 3; // scroll 3 cards at a time
      const newScrollPosition = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      
      container.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const ProductCard = ({ product }) => (
    <Link
      to={`/product/${product.product_id}`}
      className="min-w-[280px] bg-white rounded-lg overflow-hidden group relative block"
    >
      <div className="relative">
        <img
          src={product.image_url || "/api/placeholder/300/300"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full opacity-80 hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            // Add to wishlist functionality
          }}
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <div className="font-semibold mb-2">₹ {product.price}</div>
        <div className="text-sm text-gray-500">
          Earliest Delivery: In 3 hours
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="animate-pulse max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
        <div className="flex space-x-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="min-w-[280px] h-80 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !randomProducts.length) {
    return null;
  }

  return (
    <div className="mt-12 max-w-7xl mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-hidden scroll-smooth"
        >
          {randomProducts.map((product) => (
            <ProductCard key={product.product_id} product={product} />
          ))}
        </div>

        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hidden group-hover:block z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hidden group-hover:block z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SimilarProducts;