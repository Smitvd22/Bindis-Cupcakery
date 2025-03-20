import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const ViewAllProducts = ({ category }) => {
  const { categoryName } = useParams();
  const actualCategory = category || categoryName;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    fetchProducts();
  }, [actualCategory, sortBy]);

  const fetchProducts = async () => {
    try {
      let endpoint;
      switch (actualCategory) {
        case 'bestsellers':
          endpoint = `${API_ENDPOINTS.products}/category/bestsellers?sort=${sortBy}`;
          break;
        case 'new-additions':
          endpoint = `${API_ENDPOINTS.products}/category/new-additions?sort=${sortBy}`;
          break;
        default:
          endpoint = `${API_ENDPOINTS.products}/category/${encodeURIComponent(actualCategory)}?sort=${sortBy}`;
      }
      
      const response = await fetch(getApiUrl(endpoint));
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
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
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded"></div>
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold capitalize">{categoryName}</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="popularity">Popularity</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ViewAllProducts;