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

  const CustomizeDialog2 = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white w-11/12 h-5/6 rounded-lg p-6 relative">
        <button 
          onClick={() => setShowCustomizeDialog2(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4">Customize Your Hamper</h2>
        <CustomizeDessertBox 
          isOpen={showCustomizeDialog2}
          onClose={() => setShowCustomizeDialog2(false)}
        />
      </div>
    </div>
  );

  const HamperCard = ({ hamper }) => (
    <Link 
      to={`/hampers/${hamper.id}`}
      target="_blank"
      className="bg-white rounded-lg shadow-md overflow-hidden group relative block cursor-pointer"
    >
      {hamper.is_bestseller && (
        <div className="absolute top-4 left-4 bg-teal-700 text-white px-3 py-1 rounded-full text-sm">
          Best Seller
        </div>
      )}
      <div className="relative">
        <img 
          src={hamper.image_url || "/api/placeholder/300/300"} 
          alt={hamper.name}
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
        <h3 className="font-medium text-lg mb-1">{hamper.name}</h3>
        <div className="text-xl font-semibold mb-2">₹ {hamper.price}</div>
        <div className="flex items-center gap-2 mb-2">
          {hamper.rating && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
              <span className="text-sm">★ {hamper.rating}</span>
            </span>
          )}
          {hamper.review_count > 0 && (
            <span className="text-sm text-gray-500">
              ({hamper.review_count} Reviews)
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          Earliest Delivery: {hamper.delivery_time}
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Create Your Perfect Dessert</h2>
            <p className="text-gray-600">Make a dessert with your favorite items</p>
          </div>
          <button 
            onClick={() => setShowCustomizeDialog2(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Make Your Dessert Box
          </button>
        </div>
      </div>

      <div className="mb-12">
        {hampers.length === 0 && searchQuery ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No hampers found</h2>
            <p className="text-gray-600">
              We couldn't find any hampers matching &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Premium Gift Hampers'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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