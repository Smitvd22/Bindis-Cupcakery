import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Info, Gift } from 'lucide-react'; // Add Gift icon
import SimilarProducts from './SimilarProducts';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [nameOnCake, setNameOnCake] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Add showConfirmDialog state

  const availableWeights = [
    { value: 1, label: '1 KG' },
    { value: 0.5, label: '0.5 KG' },
    { value: 2, label: '2 KG' }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProductDetails();
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.products}/${id}`));
      if (!response.ok) throw new Error('Failed to fetch product details');
      const parseRes = await response.json();

      // Initialize with first weight option
      setSelectedWeight(availableWeights[0].value);
      setProduct(parseRes);
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
          'token': token  // Make sure token is being sent
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: 1,
          price: product.price * (selectedWeight || 1),
          customizations: {
            weight: selectedWeight,
            nameOnCake: nameOnCake || null
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      if (data.success) {
        alert('Product added to cart successfully!');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      if (err.message.includes('Not Authorized')) {
        navigate('/login');
      } else {
        alert(err.message || 'Failed to add product to cart');
      }
    }
  };
  // The handleBuyNow function remains the same
  const handleBuyNow = async () => {
    try {
      await addToCart();
      navigate('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  // Add handleHamperRedirect function
  const handleHamperRedirect = () => {
    setShowConfirmDialog(true);
  };

  // Add handleAddToHamper function
  const handleAddToHamper = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // First add to cart
      const response = await fetch(getApiUrl(API_ENDPOINTS.cart + '/add'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          product_id: product.product_id,
          quantity: 1,
          price: product.price * (selectedWeight || 1),
          customizations: {
            weight: selectedWeight,
            nameOnCake: nameOnCake || null
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to cart');
      }

      if (data.success) {
        setShowConfirmDialog(false); // Close the dialog
        // Navigate to hampers page after successful addition
        navigate('/hampers');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      if (err.message.includes('Not Authorized')) {
        navigate('/login');
      } else {
        alert(err.message || 'Failed to add product to cart');
      }
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

  if (!product) {
    return null;
  }

  const price = product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Product image */}
        <div className="relative aspect-square">
          <img
            src={product.image_url || "/api/placeholder/400/400"}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
          <button className="absolute top-4 right-4 p-1.5 bg-white rounded-full opacity-80 hover:opacity-100">
            <Heart className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Product details */}
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {product.is_eggless && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">EGGLESS</span>
              )}
            </div>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <div className="flex items-center gap-2">
              <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">★ {product.rating}</span>
              <span className="text-gray-600">{product.review_count} Reviews</span>
            </div>
          </div>

          <div className="text-2xl font-bold">
            ₹ {product.price}
          </div>

          <div>
            <h3 className="font-medium mb-2">Make this gift extra special</h3>
            {product.variants?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className={`p-3 sm:p-4 border rounded-lg cursor-pointer ${selectedVariant === variant.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    onClick={() => setSelectedVariant(variant.id)}
                  >
                    <img
                      src={product.image_url || "/api/placeholder/200/200"}
                      alt={variant.name}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                    <div className="text-sm">{variant.name}</div>
                    <div className="font-semibold">₹ {variant.price}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <button
                  onClick={handleHamperRedirect}
                  className="w-full px-4 py-3 border-2 border-purple-500 text-purple-500 rounded-lg font-medium hover:bg-purple-50 flex items-center justify-center gap-2"
                >
                  <Gift className="w-5 h-5" />
                  Add to Custom Hamper
                </button>

                {/* Confirmation Dialog */}
                {showConfirmDialog && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                      <h3 className="text-lg font-semibold mb-4">Add to Custom Hamper?</h3>
                      <p className="text-gray-600 mb-6">
                        Would you like to add this {product.name} to your custom hamper?
                      </p>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setShowConfirmDialog(false)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddToHamper}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          Add & Continue
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Weight Section */}
          <div>
            <h3 className="font-medium mb-2">Select Weight</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableWeights.map((weight) => (
                <button
                  key={weight.value}
                  className={`p-4 rounded-lg border ${selectedWeight === weight.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-200'
                    }`}
                  onClick={() => setSelectedWeight(weight.value)}
                >
                  <div className="text-lg font-medium">{weight.label}</div>
                  <div className="text-sm text-gray-600">₹ {product.price * weight.value}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <h3 className="font-medium">Name on Cake</h3>
              <span className="text-sm text-gray-500">{nameOnCake.length} / 25</span>
            </div>
            <input
              type="text"
              value={nameOnCake}
              onChange={(e) => setNameOnCake(e.target.value)}
              placeholder="Write Name Here"
              className="w-full px-4 py-2 border rounded"
              maxLength={25}
            />
          </div>

          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              <span className="font-medium">Offers Available</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Product Contains</h3>
            <ul className="space-y-1 text-gray-600">
              <li>• Flavor: {product.name}</li>
              <li>• Shape: {product.shape || 'Round'}</li>
              <li>• Type: {product.type || 'Cream'}</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Description</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={addToCart}
              disabled={!selectedWeight}
              className="w-full sm:w-auto px-4 py-2 border border-blue-500 text-blue-500 rounded-lg font-medium disabled:opacity-50"
            >
              ADD TO CART
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!selectedWeight}
              className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
            >
              BUY NOW | ₹ {price * (selectedWeight || 1)}
            </button>
          </div>
        </div>
      </div>

      <SimilarProducts currentProductId={product.product_id} />
    </div>
  );
};

export default ProductDetails;