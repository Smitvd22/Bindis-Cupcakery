import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast'; // Using react-hot-toast instead of shadcn
import { useNavigate } from 'react-router-dom';

const CustomizeHamperDialog = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();
  
  const pages = [
    {
      title: "Valentine Special",
      items: [
        { id: 1, name: "Red Big Heart Teddy", price: 199, image_url: "/api/placeholder/300/300" },
        { id: 2, name: "Red Artifical Rose", price: 199, image_url: "/api/placeholder/300/300" },
        { id: 3, name: "Heart Panda Teddy", price: 299, image_url: "/api/placeholder/300/300" },
        { id: 4, name: "Heart Shaped Scented Candle Set of 2", price: 299, image_url: "/api/placeholder/300/300" },
        { id: 5, name: "Love Heart Plush Hanging", price: 149, image_url: "/api/placeholder/300/300" },
        { id: 6, name: "Love Couple Showpiece", price: 375, image_url: "/api/placeholder/300/300" }
      ]
    },
    {
      title: "Chocolates",
      items: [
        { id: 7, name: "Bakingo Chocolate Almond Rocks 100 Gms", price: 199, image_url: "/api/placeholder/300/300" },
        { id: 8, name: "Heart Chocolate Box 16 Pcs", price: 545, image_url: "/api/placeholder/300/300" },
        { id: 9, name: "Pack of 8 Ferrero Rocher Chocolate", price: 499, image_url: "/api/placeholder/300/300" },
        { id: 10, name: "Bakingo Chocolate Hazelnut Rocks 100 Gms", price: 249, image_url: "/api/placeholder/300/300" }
      ]
    },
    {
      title: "Valentine Gifts",
      items: [
        { id: 11, name: "XOXO Coffee Mug", price: 199, image_url: "/api/placeholder/300/300" },
        { id: 12, name: "Set of 2 Candles", price: 620, image_url: "/api/placeholder/300/300" },
        { id: 13, name: "Engage Femme Perfume 90Ml", price: 525, image_url: "/api/placeholder/300/300" },
        { id: 14, name: "Best Girlfriend Ceramic Mug", price: 325, image_url: "/api/placeholder/300/300" }
      ]
    }
  ];

  const handleAddItem = (item) => {
    if (selectedItems.length >= 10) return;
    setSelectedItems([...selectedItems, item]);
    toast.success(`Added ${item.name} to hamper`);
  };

  const handleRemoveItem = (itemId) => {
    const itemToRemove = selectedItems.find(item => item.id === itemId);
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
    toast.success(`Removed ${itemToRemove.name} from hamper`);
  };

  const isItemSelected = (itemId) => {
    return selectedItems.some(item => item.id === itemId);
  };

  const handleAddToCart = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

        const response = await fetch('http://localhost:5000/cart/add2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({
                quantity: 1,
                price: totalPrice,
                is_custom: true,
                items: selectedItems
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to add to cart');
        }

        if (data.success) {
            toast.success('Hamper added to cart successfully!');
            onClose();
        }
    } catch (err) {
        console.error('Add to cart error:', err);
        if (err.message.includes('Not Authorized')) {
            navigate('/login');
        } else {
            toast.error(err.message || 'Failed to add hamper to cart');
        }
    }
};

  const handleBuyNow = async () => {
    try {
      await handleAddToCart();
      navigate('/cart');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-4xl rounded-lg shadow-lg">
          <div className="p-6">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-4">{pages[currentPage].title}</h2>
            <p className="text-gray-600 mb-6">Selected items: {selectedItems.length}/10</p>

            {/* Selected Items Summary */}
            {selectedItems.length > 0 && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">Selected Items:</h3>
                <div className="space-y-2">
                  {selectedItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <span>₹{item.price}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2 font-bold flex justify-between">
                    <span>Total:</span>
                    <span>₹{selectedItems.reduce((sum, item) => sum + item.price, 0)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {pages[currentPage].items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <div className="relative">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <button 
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full opacity-80 hover:opacity-100"
                    >
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="font-medium text-lg mb-1 line-clamp-2" title={item.name}>
                        {item.name}
                      </h3>
                      <div className="text-xl font-semibold mb-4">₹ {item.price}</div>
                    </div>
                    <div className="mt-auto">
                      {isItemSelected(item.id) ? (
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddItem(item)}
                          className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                          disabled={selectedItems.length >= 10}
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Updated action buttons at the bottom */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-6 py-2 border rounded-md hover:bg-gray-50"
                disabled={currentPage === 0}
              >
                Back
              </button>
              {currentPage === pages.length - 1 ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="px-6 py-3 border border-teal-700 text-teal-700 rounded-lg font-medium"
                    disabled={selectedItems.length === 0}
                  >
                    ADD TO CART
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="px-6 py-3 bg-teal-700 text-white rounded-lg font-medium"
                    disabled={selectedItems.length === 0}
                  >
                    BUY NOW | ₹{selectedItems.reduce((sum, item) => sum + item.price, 0)}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-6 py-2 bg-teal-700 text-white rounded-md hover:bg-teal-800"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeHamperDialog;