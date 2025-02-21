// import React from 'react';
// import { Heart } from 'lucide-react';
// // import { Card, CardContent } from "@/components/ui/card";

// const Orders = () => {
//   // Sample data structure matching our database
//   const categories = [
//     {
//       id: 1,
//       name: "Bestseller Cakes Online",
//       description: "Delectably Delicious in Every Layer!",
//       products: [
//         {
//           id: 1,
//           name: "Chocolate Truffle Cake",
//           price: 595,
//           rating: 4.9,
//           reviewCount: 811,
//           imageUrl: "/api/placeholder/300/300",
//           earliestDelivery: "3 hours"
//         },
//         {
//           id: 2,
//           name: "Rosy Kiss Red Velvet Cake",
//           price: 795,
//           rating: 4.8,
//           reviewCount: 267,
//           imageUrl: "/api/placeholder/300/300",
//           earliestDelivery: "3 hours"
//         },
//         {
//           id: 3,
//           name: "Divine Butterscotch Cake",
//           price: 549,
//           rating: 4.6,
//           reviewCount: 175,
//           imageUrl: "/api/placeholder/300/300",
//           earliestDelivery: "3 hours"
//         },
//         {
//           id: 4,
//           name: "Teddy Love Cake",
//           price: 1395,
//           rating: 4.7,
//           reviewCount: 242,
//           imageUrl: "/api/placeholder/300/300",
//           earliestDelivery: "3 hours"
//         }
//       ]
//     },
//     {
//       id: 2,
//       name: "Valentine Cake",
//       description: "Special cakes for valentine's day",
//       products: [
//         {
//           id: 5,
//           name: "Rosy Kiss Red Velvet Cake",
//           price: 795,
//           rating: 4.8,
//           reviewCount: 267,
//           imageUrl: "/api/placeholder/300/300",
//           earliestDelivery: "3 hours"
//         },
//         // ... more products
//       ]
//     }
//   ];

//   const ProductCard = ({ product }) => (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden group relative">
//       <div className="relative">
//         <img 
//           src={product.imageUrl} 
//           alt={product.name}
//           className="w-full h-48 object-cover"
//         />
//         <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full opacity-80 hover:opacity-100">
//           <Heart className="w-5 h-5 text-gray-600" />
//         </button>
//       </div>
//       <div className="p-4">
//         <h3 className="font-medium text-lg mb-1">{product.name}</h3>
//         <div className="text-xl font-semibold mb-2">₹ {product.price}</div>
//         <div className="flex items-center gap-2 mb-2">
//           <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800">
//             <span className="text-sm">★ {product.rating}</span>
//           </span>
//           {product.reviewCount && (
//             <span className="text-sm text-gray-500">
//               ({product.reviewCount} Reviews)
//             </span>
//           )}
//         </div>
//         <div className="text-sm text-gray-500">
//           Earliest Delivery: In {product.earliestDelivery}
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-8">
//       {categories.map((category) => (
//         <div key={category.id} className="mb-12">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h2 className="text-2xl font-bold mb-1">{category.name}</h2>
//               <p className="text-gray-600">{category.description}</p>
//             </div>
//             <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//               View All
//             </button>
//           </div>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {category.products.map((product) => (
//               <ProductCard key={product.id} product={product} />
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };
// export default Orders;



import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Orders = () => {
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchQuery = searchParams.get('q') || '';

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
      const response = await fetch(`http://localhost:5000/orders/search?query=${encodeURIComponent(query)}`);

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
      const response = await fetch("http://localhost:5000/orders/");

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
      className="bg-white rounded-lg shadow-md overflow-hidden group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      onClick={() => window.open(`/product/${product.id}`, '_blank')}
    >
      <div className="relative overflow-hidden">
        <img
          src={product.image_url || "/api/placeholder/300/300"}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full transform translate-x-0 transition-all duration-300 hover:scale-110">
          <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors duration-300" />
        </button>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 transform transition-transform duration-300 group-hover:translate-y-1">
        <h3 className="font-medium text-lg mb-1 transition-colors duration-300 group-hover:text-pink-600">{product.name}</h3>
        <div className="text-xl font-semibold mb-2 transition-all duration-300 group-hover:scale-110 origin-left">₹ {product.price}</div>
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 transition-all duration-300 group-hover:bg-green-200">
            <span className="text-sm transform transition-transform group-hover:scale-110">★ {product.rating}</span>
          </span>
          {product.review_count > 0 && (
            <span className="text-sm text-gray-500 transition-opacity duration-300 group-hover:opacity-75">
              ({product.review_count} Reviews)
            </span>
          )}
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
                <button className="px-4 py-2 bg-[#f0adbc] text-black rounded-md transition-all duration-300 hover:bg-[#f8bbd0] hover:shadow-lg hover:scale-105">
                  <Link
                    to={`/category/${category.category_name}`}
                    rel="noopener noreferrer"
                  >
                    View All
                  </Link>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;