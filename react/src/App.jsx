import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

//components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import OrdersPage from './components/OrdersPage';
import ProductPage from './components/ProductPage';
import HampersPage from './components/HampersPage';
import CartPage from './components/CartPage';

  const App = () => {
    return (
        <Router>
          <AppContent />
        </Router>
    );
  };

  const AppContent = () => {
    const { user, login, logout } = useAuth(); // Now inside AuthProvider
    const [cart, setCart] = useState([]);
  
    const addToCart = (item) => {
      setCart([...cart, item]);
    };
  
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar cartCount={cart.length} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
            <Route path="/hampers" element={<HampersPage addToCart={addToCart} />} />
            <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
          </Routes>
        </main>
  
      </div>
    );
  };

//   return (
//     <AuthProvider>
//     <Router>
//       <div className="min-h-screen bg-gray-50">
//         <Navbar cartCount={cart.length} setIsLoginOpen={setIsLoginOpen} />
//         <main className="container mx-auto px-4 py-8">
//           <Routes>
//             <Route path="/" element={<HomePage setIsLoginOpen={setIsLoginOpen} />} />
//             <Route path="/orders" element={<OrdersPage />} />
//             <Route path="/product/:id" element={<ProductPage addToCart={addToCart} />} />
//             <Route path="/hampers" element={<HampersPage addToCart={addToCart} />} />
//             <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
//           </Routes>
//         </main>

//         {/* Login/Signup Dialog */}
//         {isLoginOpen && (
//           <AuthDialog isOpen={isLoginOpen} setIsOpen={setIsLoginOpen} />
//         )}
//       </div>
//     </Router>
//     </AuthProvider>
//   );
// };

const LoginDialog = ({ isOpen, setIsOpen }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log('Form submitted:', formData);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name"
              className="w-full p-2 border rounded"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
          <button
            type="submit"
            className="w-full bg-pink-600 text-white p-2 rounded hover:bg-pink-700"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <button
          className="mt-4 text-pink-600 hover:underline"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default App;