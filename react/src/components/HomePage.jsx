import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = ({ setIsLoginOpen }) => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Our Cake Shop
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Discover our delicious cakes and custom hampers
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/orders"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
          >
            Order Now
          </Link>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-white text-pink-600 px-6 py-3 rounded-lg border border-pink-600 hover:bg-pink-50"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Featured Cakes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sample featured products */}
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200" /> {/* Placeholder for image */}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">Delicious Cake {item}</h3>
                <p className="text-gray-600 mb-2">Lorem ipsum dolor sit amet</p>
                <p className="text-pink-600 font-bold">$29.99</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;