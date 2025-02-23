import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown } from 'lucide-react';
import SimilarHampers from './SimilarHampers';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const HamperDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hamper, setHamper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pincode, setPincode] = useState('');
  const [showOffers, setShowOffers] = useState(false);

  useEffect(() => {
    fetchHamperDetails();
  }, [id]);

  const fetchHamperDetails = async () => {
    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.hampers}/${id}`));
      if (!response.ok) throw new Error('Failed to fetch hamper details');
      const parseRes = await response.json();
      setHamper(parseRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


const addToCart = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
    
        const response = await fetch(getApiUrl(API_ENDPOINTS.cart + '/add'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({
                hamper_id: hamper.hamper_id, // Use hamper_id instead of id
                quantity: 1,
                price: hamper.price
            })
        });
    
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add to cart');
        }
    
        if (data.success) {
            alert('Hamper added to cart successfully!');
        }
    } catch (err) {
        console.error('Add to cart error:', err);
        if (err.message.includes('Not Authorized')) {
            navigate('/login');
        } else {
            alert(err.message || 'Failed to add hamper to cart');
        }
    }
};

  const handleBuyNow = async () => {
    try {
      await addToCart();
      navigate('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          <div className="bg-gray-200 rounded-lg aspect-square"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 sm:w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!hamper) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
              <img 
                src={hamper.image_url || "/api/placeholder/400/400"} 
                alt={hamper.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/placeholder.png";
                }}
              />
              <button 
                className="absolute top-4 right-4 p-2 bg-white rounded-full 
                         shadow-lg opacity-90 hover:opacity-100 transition-opacity
                         focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Right Column - Hamper Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">{hamper.name}</h1>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                ₹ {hamper.price}
              </div>
            </div>

            {/* Offers Section */}
            <div 
              className="bg-blue-50 rounded-lg p-4 cursor-pointer 
                       hover:bg-blue-100 transition-colors duration-200"
              onClick={() => setShowOffers(!showOffers)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-base sm:text-lg">Offers Available</h3>
                <ChevronDown 
                  className={`w-5 h-5 transform transition-transform duration-200 
                           ${showOffers ? 'rotate-180' : ''}`} 
                />
              </div>
              {showOffers && (
                <div className="mt-3 space-y-2 text-sm sm:text-base">
                  <p>• Get 10% off on orders above ₹1999</p>
                  <p>• Free delivery on orders above ₹999</p>
                </div>
              )}
            </div>

            {/* Product Contents */}
            {hamper.contents && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-base sm:text-lg mb-3">Product Contains</h3>
                <ul className="space-y-2 text-gray-600">
                  {Object.entries(hamper.contents).map(([item, quantity]) => (
                    <li key={item} className="flex items-start space-x-2 text-sm sm:text-base">
                      <span className="text-gray-400">•</span>
                      <span>
                        {typeof quantity === 'object'
                          ? Object.entries(quantity)
                              .map(([key, val]) => ` ${val}`)
                              .join(', ')
                          : quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {hamper.description && (
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-medium text-base sm:text-lg mb-2">Description</h3>
                <p className="text-gray-600 text-sm sm:text-base">{hamper.description}</p>
              </div>
            )}

            {/* SKU */}
            <div className="text-xs sm:text-sm text-gray-500">
              SKU Number<br />
              {hamper.hamper_id}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={addToCart}
                className="w-full sm:flex-1 px-6 py-3 border-2 border-teal-700 
                         text-teal-700 rounded-lg font-medium text-base sm:text-lg
                         hover:bg-teal-50 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                ADD TO CART
              </button>
              <button 
                onClick={handleBuyNow}
                className="w-full sm:flex-1 px-6 py-3 bg-teal-700 text-white 
                         rounded-lg font-medium text-base sm:text-lg
                         hover:bg-teal-800 transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                BUY NOW | ₹ {hamper.price}
              </button>
            </div>
          </div>
        </div>

        {/* Similar Hampers Section */}
        <div className="mt-12">
          <SimilarHampers currentHamperId={hamper.id} />
        </div>
      </div>
    </div>
  );
};

export default HamperDetails;