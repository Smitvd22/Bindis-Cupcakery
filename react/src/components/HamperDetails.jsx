import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ChevronDown } from 'lucide-react';
import SimilarHampers from './SimilarHampers';

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
      const response = await fetch(`http://localhost:5000/hampers/${id}`);
      if (!response.ok) throw new Error('Failed to fetch hamper details');
      const parseRes = await response.json();
      setHamper(parseRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

//   const checkDelivery = async () => {
//     console.log('Checking delivery for pincode:', pincode);
//   };

const addToCart = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
    
        const response = await fetch('http://localhost:5000/cart/add', {
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
      <div className="max-w-7xl mx-auto p-4">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-200 rounded-lg h-96"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!hamper) return null;

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left Column - Images */}
      <div className="space-y-4">
        <div className="relative">
          <img 
            src={hamper.image_url || "/api/placeholder/400/400"} 
            alt={hamper.name}
            className="w-full rounded-lg"
          />
          <button className="absolute top-4 right-4 p-1.5 bg-white rounded-full opacity-80 hover:opacity-100">
            <Heart className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Right Column - Hamper Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">{hamper.name}</h1>
          <div className="text-2xl font-bold">₹ {hamper.price}</div>
        </div>

        {/* Delivery Check */}
        {/* <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium mb-2">Check Delivery Availability</h3>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter Pincode"
                className="w-full px-4 py-2 border rounded"
              />
            </div>
            <button
              onClick={checkDelivery}
              className="px-6 py-2 bg-teal-700 text-white rounded"
            >
              Check
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Available in limited cities*</p>
        </div> */}

        {/* Offers */}
        <div 
          className="bg-blue-50 rounded-lg p-4 cursor-pointer"
          onClick={() => setShowOffers(!showOffers)}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Offers Available</h3>
            <ChevronDown className={`w-5 h-5 transform transition-transform ${showOffers ? 'rotate-180' : ''}`} />
          </div>
          {showOffers && (
            <div className="mt-2 space-y-2">
              <p className="text-sm">• Get 10% off on orders above ₹1999</p>
              <p className="text-sm">• Free delivery on orders above ₹999</p>
            </div>
          )}
        </div>

        {/* Product Contains */}
        {hamper.contents && (
          <div>
            <h3 className="font-medium mb-2">Product Contains</h3>
            <ul className="space-y-1 text-gray-600">
            {Object.entries(hamper.contents).map(([item, quantity]) => (
                <li key={item}>
                • 
                {typeof quantity === 'object'
                    ? Object.entries(quantity)
                        .map(([key, val]) => ` ${val}`)
                        .join(', ')
                    : quantity}
                </li>
            ))}
            </ul>

          </div>
        )}

        {/* Description */}
        {hamper.description && (
          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-gray-600">{hamper.description}</p>
          </div>
        )}

        {/* SKU */}
        <div className="text-sm text-gray-500">
          SKU Number<br />
          {hamper.hamper_id}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={addToCart}
            className="flex-1 px-6 py-3 border border-teal-700 text-teal-700 rounded-lg font-medium"
          >
            ADD TO CART
          </button>
          <button 
            onClick={handleBuyNow}
            className="flex-1 px-6 py-3 bg-teal-700 text-white rounded-lg font-medium"
          >
            BUY NOW | ₹ {hamper.price}
          </button>
        </div>
      </div>

      {/* Similar Hampers Section */}
      <SimilarHampers currentHamperId={hamper.id} />
    </div>
  );
};

export default HamperDetails;