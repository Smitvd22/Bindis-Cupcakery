import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import CustomizeDessertBox from './CustomizeDessertBox';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const Hampers = () => {
  const [searchParams] = useSearchParams();
  const [hampers, setHampers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCustomizeDialog2, setShowCustomizeDialog2] = useState(false);
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    window.scrollTo(0, 0);
    if (searchQuery) {
      searchHampers(searchQuery);
    } else {
      fetchHampers();
    }
  }, [searchQuery]);

  const searchHampers = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.hampers}/search?query=${encodeURIComponent(query)}`));

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const parseRes = await response.json();
      setHampers(parseRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHampers = async () => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.hampers));
      
      if (!response.ok) {
        throw new Error('Failed to fetch hampers');
      }

      const parseRes = await response.json();
      setHampers(parseRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Updated CustomizeDialog2 with responsive styling
  const CustomizeDialog2 = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 sm:p-6">
      <div className="bg-white w-full max-w-4xl h-[90vh] sm:h-5/6 rounded-lg overflow-auto relative">
        <button 
          onClick={() => setShowCustomizeDialog2(false)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 
                   focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-full"
          aria-label="Close dialog"
        >
          ✕
        </button>
        <div className="p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Customize Your Hamper</h2>
          <CustomizeDessertBox 
            isOpen={showCustomizeDialog2}
            onClose={() => setShowCustomizeDialog2(false)}
          />
        </div>
      </div>
    </div>
  );

  // Updated HamperCard with responsive styling
  const HamperCard = ({ hamper }) => (
    <Link 
      to={`/hampers/${hamper.id}`}
      target="_blank"
      className="bg-white rounded-lg shadow-md overflow-hidden group relative block 
                cursor-pointer transform transition-transform duration-300 
                hover:scale-[1.02] hover:shadow-lg"
    >
      {hamper.is_bestseller && (
        <div className="absolute top-4 left-4 bg-teal-700 text-white px-3 py-1 
                     rounded-full text-xs sm:text-sm z-10">
          Best Seller
        </div>
      )}
      <div className="relative aspect-square">
        <img 
          src={hamper.image_url || "/api/placeholder/300/300"} 
          alt={hamper.name}
          className="w-full h-full object-cover transition-transform duration-300 
                   group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/placeholder.png";
          }}
        />
        <button 
          className="absolute top-2 right-2 p-2 bg-white rounded-full opacity-80 
                   hover:opacity-100 transition-opacity duration-200 
                   focus:outline-none focus:ring-2 focus:ring-pink-500"
          onClick={(e) => {
            e.preventDefault();
            // Add to wishlist functionality
          }}
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-medium text-base sm:text-lg mb-1 line-clamp-2">{hamper.name}</h3>
        <div className="text-lg sm:text-xl font-semibold mb-2">₹ {hamper.price}</div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {hamper.rating && (
            <span className="inline-flex items-center px-2 py-1 rounded-md 
                         bg-green-100 text-green-800 text-xs sm:text-sm">
              <span>★ {hamper.rating}</span>
            </span>
          )}
          {hamper.review_count > 0 && (
            <span className="text-xs sm:text-sm text-gray-500">
              ({hamper.review_count} Reviews)
            </span>
          )}
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          Earliest Delivery: {hamper.delivery_time}
        </div>
      </div>
    </Link>
  );

  // Main component return with responsive layout
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Customize Box Banner */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg 
                   p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start 
                     sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Create Your Perfect Dessert</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Make a dessert with your favorite items
            </p>
          </div>
          <button 
            onClick={() => setShowCustomizeDialog2(true)}
            className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-md 
                     hover:bg-purple-700 transition-colors duration-200 text-sm sm:text-base"
          >
            Make Your Dessert Box
          </button>
        </div>
      </div>

      {/* Hampers Grid */}
      <div className="mb-8 sm:mb-12">
        {hampers.length === 0 && searchQuery ? (
          <div className="text-center py-8 sm:py-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              No hampers found
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              We couldn't find any hampers matching &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Premium Gift Hampers'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 
                         gap-4 sm:gap-6">
              {hampers.map((hamper) => (
                <HamperCard key={hamper.id} hamper={hamper} />
              ))}
            </div>
          </>
        )}
      </div>

      {showCustomizeDialog2 && <CustomizeDialog2 />}
    </div>
  );
};

export default Hampers;