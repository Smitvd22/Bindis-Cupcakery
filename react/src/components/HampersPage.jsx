import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

// Sample data
const availableHampers = [
  {
    id: 1,
    name: 'Birthday Celebration',
    price: 89.99,
    description: 'Perfect birthday hamper with cake and treats',
    items: ['Chocolate Cake', 'Cupcakes (4)', 'Cookies (6)', 'Candles'],
    image: '/api/placeholder/300/200'
  },
  // Add more hampers...
];

const availableItems = [
  { id: 1, name: 'Chocolate Cake', price: 29.99, category: 'Cakes' },
  { id: 2, name: 'Cupcakes (4)', price: 12.99, category: 'Cupcakes' },
  { id: 3, name: 'Cookies (6)', price: 9.99, category: 'Cookies' },
  // Add more items...
];

const HampersPage = ({ addToCart }) => {
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customHamper, setCustomHamper] = useState([]);

  const handleAddCustomHamper = () => {
    addToCart({
      id: 'custom-hamper',
      name: 'Custom Hamper',
      price: customHamper.reduce((sum, item) => sum + item.price, 0),
      items: customHamper,
    });
    setIsCustomizeOpen(false);
    setCustomHamper([]);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Custom Hamper Button */}
      <div className="mb-8">
        <button
          onClick={() => setIsCustomizeOpen(true)}
          className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
        >
          Create Custom Hamper
        </button>
      </div>

      {/* Pre-made Hampers Grid */}
      <h2 className="text-2xl font-bold mb-6">Available Hampers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableHampers.map((hamper) => (
          <div
            key={hamper.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={hamper.image}
              alt={hamper.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold mb-2">{hamper.name}</h3>
              <p className="text-gray-600 mb-2">{hamper.description}</p>
              <ul className="text-sm text-gray-500 mb-4">
                {hamper.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
              <p className="text-pink-600 font-bold mb-4">${hamper.price}</p>
              <button
                onClick={() => addToCart(hamper)}
                className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Hamper Dialog */}
      <Dialog
        open={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
            <Dialog.Title className="text-2xl font-bold mb-4">
              Create Custom Hamper
            </Dialog.Title>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Available Items</h3>
              <div className="grid grid-cols-2 gap-4">
                {availableItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCustomHamper([...customHamper, item])}
                    className="p-2 border rounded-md hover:bg-pink-50"
                  >
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500">${item.price}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Your Custom Hamper</h3>
              {customHamper.length > 0 ? (
                <ul className="space-y-2">
                  {customHamper.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <button
                        onClick={() => setCustomHamper(customHamper.filter((_, i) => i !== index))}
                        className="text-red-600"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No items added yet</p>
              )}
            </div>

            <div className="flex justify-between items-center">
              <p className="font-bold">
                Total: ${customHamper.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => setIsCustomizeOpen(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCustomHamper}
                  disabled={customHamper.length === 0}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default HampersPage;