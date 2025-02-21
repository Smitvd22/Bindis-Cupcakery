import React from 'react';
import { Link } from 'react-router-dom';

// Sample data - in a real app, this would come from an API
const cakes = [
  {
    id: 1,
    name: 'Chocolate Truffle',
    price: 29.99,
    description: 'Rich chocolate cake with truffle frosting',
    image: '/api/placeholder/300/200'
  },
  {
    id: 2,
    name: 'Vanilla Bean',
    price: 24.99,
    description: 'Classic vanilla cake with buttercream',
    image: '/api/placeholder/300/200'
  },
  // Add more cakes...
];

const OrdersPage = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Our Cakes</h1>
      
      {/* Filters */}
      <div className="mb-8 flex gap-4">
        <select className="border rounded-md p-2">
          <option>All Categories</option>
          <option>Birthday Cakes</option>
          <option>Wedding Cakes</option>
          <option>Custom Cakes</option>
        </select>
        
        <select className="border rounded-md p-2">
          <option>Sort by: Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* Cake Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cakes.map((cake) => (
          <Link 
            key={cake.id}
            to={`/product/${cake.id}`}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={cake.image}
              alt={cake.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{cake.name}</h2>
              <p className="text-gray-600 mb-2">{cake.description}</p>
              <p className="text-pink-600 font-bold">${cake.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;