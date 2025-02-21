"use client"

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AnimatePresence } from "framer-motion";

// Components
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Navbar from "./components/Navbar";
import Orders from "./components/Orders";
import Hampers from "./components/Hampers";
import HamperDetails from "./components/HamperDetails";
import Cart from "./components/Cart";
import Home from "./components/Home";
import ProductDetails from "./components/ProductDetails";
import ViewAllProducts from "./components/ViewAllProducts";
import AdminDashboard from "./components/AdminDashboard";
import ReviewDialog from "./components/ReviewDialog";
import AdminLogin from "./components/AdminLogin";
import PageLoader from "./components/PageLoader";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import TrackOrder from './components/TrackOrder';
import Payment from "./components/Payment";
import Success from "./components/Success";
import Failure from "./components/Failure";
// import SearchPage from "./components/SearchPage";

const AdminProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

const AppContent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [hasJustLoggedIn, setHasJustLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  const setAuth = (boolean) => {
    setIsAuthenticated(boolean);
    setHasJustLoggedIn(boolean);
  };

  const setAdminAuth = (boolean) => {
    setIsAdminAuthenticated(boolean);
  };

  const checkPendingReviews = async () => {
    if (!isAuthenticated || !localStorage.token) return;

    try {
      const decodedToken = jwtDecode(localStorage.token);
      const userId = decodedToken.user;

      if (!userId) {
        console.error("User ID is missing in token!");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/reviews/pending/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.showDialog) {
        setPendingReviews(data.reviews);
        setCurrentReview(data.currentReview);
      }
    } catch (error) {
      console.error("Error checking pending reviews:", error);
    }
  };

  async function isAuth() {
    try {
      const response = await fetch("http://localhost:5000/auth/is-verify", {
        method: "GET",
        headers: { token: localStorage.token }
      });
      const parseRes = await response.json();
      setIsAuthenticated(parseRes === true);
    } catch (err) {
      console.error(err.message);
    }
  }

  async function getUserInfo() {
    try {
      const response = await fetch("http://localhost:5000/dashboard/", {
        method: "GET",
        headers: { token: localStorage.token }
      });
      const parseRes = await response.json();
      setUserName(parseRes.user_name);
      setUserId(parseRes.user_id);
    } catch (err) {
      console.error(err.message);
    }
  }

  useEffect(() => {
    isAuth();
    if (isAuthenticated) {
      getUserInfo();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    checkPendingReviews();
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const isAdminPage = location.pathname.startsWith("/admin");

  if (isAdminPage && location.pathname !== "/admin/login") {
    return (
      <AdminProtectedRoute>
        <AdminDashboard setAdminAuth={setAdminAuth} />
      </AdminProtectedRoute>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      {!isAdminPage && (
        <Navbar
          isAuthenticated={isAuthenticated}
          setAuth={setAuth}
          userName={userName}
        />
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <PageLoader key="loader" />
        ) : (
          <main className="flex-grow w-full mt-2" key={location.pathname}>
            <div className="w-full">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setAuth={setAuth} />} />
                <Route path="/register" element={<Register setAuth={setAuth} />} />
                <Route path="/dashboard" element={<Dashboard setAuth={setAuth} />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/hampers" element={<Hampers />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/category/:categoryName" element={<ViewAllProducts />} />
                <Route path="/hampers/:id" element={<HamperDetails />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/success/" element={<Success />} />
                <Route path="/failure/" element={<Failure />} />
                {/* <Route path="/search" element={<SearchPage />} /> */}
                <Route
                  path="/admin/login"
                  element={
                    <AdminLogin
                      setAuth={setAdminAuth}
                      isAuthenticated={isAdminAuthenticated}
                    />
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboard setAdminAuth={setAdminAuth} />
                    </AdminProtectedRoute>
                  }
                />
              </Routes>
            </div>
          </main>
        )}
      </AnimatePresence>

      <Footer />
      <WhatsAppButton />

      {currentReview && (
        <ReviewDialog
          review={currentReview}
          userId={userId}
          onClose={() => setCurrentReview(null)}
          onSubmitSuccess={() => {
            setPendingReviews(prev =>
              prev.filter(r => r.product_id !== currentReview.product_id)
            );
            setCurrentReview(null);
          }}
        />
      )}
    </div>
  );
};

const App3 = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App3;