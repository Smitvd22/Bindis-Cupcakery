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
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden group relative cursor-pointer flex flex-col h-full"
      onClick={() => window.open(`/product/${product.id}`, '_blank')}
    >
      <div className="relative aspect-square w-full">
        <img 
          src={product.image_url || "/api/placeholder/300/300"} 
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/images/placeholder.png";
          }}
        />
        <button 
          className="absolute top-3 right-3 p-1.5 bg-white rounded-full opacity-80 hover:opacity-100 transition-opacity duration-200 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart className="w-5 h-5 text-gray-600" />
        </button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium text-lg mb-1 line-clamp-2">{product.name}</h3>
        <div className="text-xl font-semibold mb-2">₹ {product.price}</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
            <span className="text-sm">★ {product.rating}</span>
          </span>
          {product.review_count > 0 && (
            <span className="text-sm text-gray-500">
              ({product.review_count} Reviews)
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500 mt-auto">
          Earliest Delivery: In 3 hours
        </div>
      </div>
    </div>
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