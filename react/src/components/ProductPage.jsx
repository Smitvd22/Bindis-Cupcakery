import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// Sample data - in a real app, this would come from an API
const cakeDetails = {
  id: 1,
  name: 'Chocolate Truffle',
  price: 29.99,
  description: 'Rich chocolate cake with truffle frosting',
  longDescription: 'Our signature chocolate truffle cake is made with the finest Belgian chocolate and fresh cream. Perfect for special occasions.',
  image: '/api/placeholder/600/400',
  sizes: ['6 inch', '8 inch', '10 inch'],
  flavors: ['Classic Chocolate', 'Dark Chocolate', 'White Chocolate'],
};

const similarCakes = [
  {
    id: 2,
    name: 'Vanilla Bean',
    price: 24.99,
    image: '/api/placeholder/300/200',
  },
  // Add more similar cakes...
];

const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState(cakeDetails.sizes[0]);
  const [selectedFlavor, setSelectedFlavor] = useState(cakeDetails.flavors[0]);

  const handleAddToCart = () => {
    addToCart({
      ...cakeDetails,
      selectedSize,
      selectedFlavor,
      quantity: 1,
    });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Product Image */}
        <div>
          <img
            src={cakeDetails.image}
            alt={cakeDetails.name}
            className="w-full rounded-lg"
          />
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{cakeDetails.name}</h1>
          <p className="text-2xl text-pink-600 font-bold mb-4">
            ${cakeDetails.price}
          </p>
          <p className="text-gray-600 mb-6">{cakeDetails.longDescription}</p>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Select Size</h3>
            <div className="flex gap-4">
              {cakeDetails.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-md ${
                    selectedSize === size
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Flavor Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Select Flavor</h3>
            <select
              value={selectedFlavor}
              onChange={(e) => setSelectedFlavor(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {cakeDetails.flavors.map((flavor) => (
                <option key={flavor} value={flavor}>
                  {flavor}
                </option>
              ))}
            </select>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700"
          >
            Add to Cart
          </button>

          {/* Add to Hamper Button */}
          <Link
            to="/hampers"
            className="w-full mt-4 border border-pink-600 text-pink-600 py-3 rounded-lg flex items-center justify-center hover:bg-pink-50"
          >
            Add to Custom Hamper
          </Link>
        </div>
      </div>

      {/* Similar Products */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Similar Cakes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {similarCakes.map((cake) => (
            <Link
              key={cake.id}
              to={`/product/${cake.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={cake.image}
                alt={cake.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">{cake.name}</h3>
                <p className="text-pink-600">${cake.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;