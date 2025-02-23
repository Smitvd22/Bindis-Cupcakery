import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Search } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const Orders = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchQuery = searchParams.get('q') || '';
  const navigate = useNavigate();

  // Add search handler
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.querySelector('input');
    const query = searchInput.value.trim();
    
    if (query) {
      navigate(`/orders?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      searchProducts(searchQuery);
    } else {
      fetchCategories();
    }
  }, [searchQuery]);

  const searchProducts = async (query) => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl(`${API_ENDPOINTS.orders}/search?query=${encodeURIComponent(query)}`));

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const parseRes = await response.json();
      setCategories(parseRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.orders));

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      const parseRes = await response.json();
      setCategories(parseRes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ProductCard = ({ product }) => (
    <Link 
      to={`/product/${product.id}`}
      className="bg-white rounded-lg shadow-md p-3 sm:p-4 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <img 
          src={product.image_url || "/api/placeholder/300/300"}
          alt={product.name}
          className="w-full h-full object-cover rounded-lg transform hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/placeholder.png";
          }}
        />
        <button 
          className="absolute top-2 right-2 p-1.5 bg-white rounded-full opacity-80 hover:opacity-100"
          onClick={(e) => {
            e.preventDefault();
            // Add wishlist functionality here
          }}
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="mt-3 space-y-2">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="text-lg sm:text-xl font-semibold text-gray-900">₹ {product.price}</div>
          {product.rating > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-sm">
              ★ {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        {product.review_count > 0 && (
          <p className="text-sm text-gray-500">
            ({product.review_count} {product.review_count === 1 ? 'Review' : 'Reviews'})
          </p>
        )}
      </div>
    </Link>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="bg-gray-200 h-64 rounded"></div>
                ))}
              </div>
            </div>
          ))}
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
    <div className="min-h-screen bg-pink-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {categories.length === 0 && searchQuery && !loading ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No products found</h2>
            <p className="text-gray-600">
              We couldn't find any products matching &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.category_id} className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{category.category_name}</h2>
                  <p className="text-gray-600">{category.category_description}</p>
                </div>
                {!searchQuery && (
                  <Link
                    to={`/category/${category.category_name}`}
                    className="px-4 py-2 bg-[#f0adbc] text-black rounded-md transition-all duration-300 
                             hover:bg-[#f8bbd0] hover:shadow-lg hover:scale-105"
                  >
                    View All
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {category.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;