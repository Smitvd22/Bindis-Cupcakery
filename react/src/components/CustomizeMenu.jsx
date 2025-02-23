import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const CustomizeMenu = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newProduct, setNewProduct] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    image_url: '',
    is_bestseller: false,
    is_eggless: false,
    shape: '',
    type: '',
    available_weights: [], // Changed to array
    variants: []          // Changed to array
  });
  const [showAddProduct, setShowAddProduct] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(getApiUrl(API_ENDPOINTS.adminCategories));
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post(getApiUrl(API_ENDPOINTS.adminCategories), newCategory);
      setNewCategory({ name: '', description: '' });
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure? This will delete all products in this category.')) {
      try {
        await axios.delete(getApiUrl(`${API_ENDPOINTS.adminCategories}/${categoryId}`));
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      // Validate and truncate input data
      const productData = {
        category_id: parseInt(newProduct.category_id),
        name: newProduct.name.slice(0, 100), // Limit name length
        description: newProduct.description.slice(0, 500), // Limit description length
        price: parseFloat(newProduct.price) || 0,
        image_url: newProduct.image_url.slice(0, 500), // Limit URL length
        is_bestseller: Boolean(newProduct.is_bestseller),
        is_eggless: Boolean(newProduct.is_eggless),
        shape: (newProduct.shape || '').slice(0, 50),
        type: (newProduct.type || '').slice(0, 50),
        available_weights: Array.isArray(newProduct.available_weights) 
          ? newProduct.available_weights.slice(0, 10) // Limit number of weights
          : [],
        variants: Array.isArray(newProduct.variants) 
          ? newProduct.variants.slice(0, 10) // Limit number of variants
          : []
      };

      const response = await axios.post(getApiUrl(API_ENDPOINTS.adminProducts), productData);
      
      if (response.data) {
        // Reset form
        setNewProduct({
          category_id: '',
          name: '',
          description: '',
          price: '',
          image_url: '',
          is_bestseller: false,
          is_eggless: false,
          shape: '',
          type: '',
          available_weights: [],
          variants: []
        });
        setShowAddProduct(false);
        await fetchCategories();
        // Show success message
        alert('Product added successfully!');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      // Show user-friendly error message
      alert(
        'Failed to add product. Please check:\n' +
        '- All text fields are under 500 characters\n' +
        '- Image URL is valid\n' +
        '- Price is a valid number'
      );
    }
  };

  const deleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(getApiUrl(`${API_ENDPOINTS.adminProducts}/${productId}`));
        fetchCategories();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const toggleProductStatus = async (productId) => {
    try {
      await axios.patch(getApiUrl(`${API_ENDPOINTS.adminProducts}/${productId}/toggle-status`));
      fetchCategories();
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  // Add available weight handler
  const handleAddWeight = (weight) => {
    setNewProduct(prev => ({
      ...prev,
      available_weights: [...prev.available_weights, { value: weight, label: `${weight}kg` }]
    }));
  };

  return (
    <div className="h-full overflow-auto bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Add New Category Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Add New Category</h2>
          <form onSubmit={addCategory} className="space-y-4">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="border p-3 rounded-lg w-full"
            />
            <textarea
              placeholder="Category Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="border p-3 rounded-lg w-full"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Add Category
            </button>
          </form>
        </div>
  
        {/* Toggle Add Product Form Button */}
        <button
          onClick={() => setShowAddProduct(!showAddProduct)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md"
        >
          <Plus className="inline-block mr-2" /> Add New Product
        </button>
  
        {/* Add New Product Section */}
        {showAddProduct && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={addProduct} className="space-y-4">
              <select
                value={newProduct.category_id}
                onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                className="border p-3 rounded-lg w-full"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="border p-3 rounded-lg w-full"
                maxLength={100}
                required
              />
              <textarea
                placeholder="Product Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="border p-3 rounded-lg w-full"
                maxLength={500}
                required
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="border p-3 rounded-lg w-full"
                step="0.01"
                min="0"
                required
              />
              <input
                type="url"
                placeholder="Image URL"
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                className="border p-3 rounded-lg w-full"
                maxLength={500}
                required
              />
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProduct.is_bestseller}
                    onChange={(e) => setNewProduct({ ...newProduct, is_bestseller: e.target.checked })}
                    className="mr-2"
                  />
                  Bestseller
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newProduct.is_eggless}
                    onChange={(e) => setNewProduct({ ...newProduct, is_eggless: e.target.checked })}
                    className="mr-2"
                  />
                  Eggless
                </label>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                Add Product
              </button>
            </form>
          </div>
        )}
  
        {/* Categories and Products */}
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.category_id} className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{category.name}</h3>
                <button
                  onClick={() => deleteCategory(category.category_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mb-4">{category.description}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {category.products && category.products.map((product) => (
                  <div key={product.product_id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">{product.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleProductStatus(product.product_id)}
                          className={product.is_active ? "text-green-500" : "text-gray-400"}
                        >
                          {product.is_active ? <ToggleRight /> : <ToggleLeft />}
                        </button>
                        <button
                          onClick={() => deleteProduct(product.product_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{product.description}</p>
                    <p className="font-bold mt-2">${product.price}</p>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="mt-2 w-full h-32 object-cover rounded"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
};

export default CustomizeMenu;