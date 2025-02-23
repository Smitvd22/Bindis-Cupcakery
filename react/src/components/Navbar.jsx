import { Store, Search, Package2, History, CakeSlice, ShoppingCart, User, LogIn, Grid, Menu, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import UserProfileDialog from '../components/UserProfileDialog'
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const MobileHeader = ({ 
  showMobileSearch, 
  setShowMobileSearch, 
  isAuthenticated, 
  setIsProfileOpen, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) => (
  <div className="flex items-center gap-2 lg:hidden">
    <button
      onClick={() => setShowMobileSearch(!showMobileSearch)}
      className="p-2 text-black hover:text-pink-600"
      aria-label="Toggle search"
    >
      <Search className="h-6 w-6" />
    </button>
    
    {isAuthenticated ? (
      <button
        onClick={() => setIsProfileOpen(true)}
        className="p-2 text-black hover:text-pink-600"
        aria-label="Open profile"
      >
        <User className="h-6 w-6" />
      </button>
    ) : (
      <Link 
        to="/login" 
        className="p-2 text-black hover:text-pink-600"
        aria-label="Login"
      >
        <LogIn className="h-6 w-6" />
      </Link>
    )}

    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="p-2 text-black hover:text-pink-600"
      aria-label="Toggle menu"
    >
      {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  </div>
);

const MobileMenu = ({ categories, isOpen, onClose }) => (
  isOpen && (
    <div className="lg:hidden bg-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <nav className="grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={category.path}
              className="flex items-center justify-center p-3 text-center text-sm 
                       text-gray-800 hover:text-pink-600 bg-gray-50 rounded-md
                       hover:bg-gray-100 transition-colors duration-200"
              onClick={onClose}
            >
              {category.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
);

function Navbar({ isAuthenticated, setAuth, userName, userEmail, userPhone }) {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [userData, setUserData] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate()

  const items = ["cupcake", "cake", "icecream", "brownie", "donut"]
  const period = 2000
  const delta = 200

  useEffect(() => {
    let ticker = setInterval(() => {
      tick()
    }, delta)

    return () => clearInterval(ticker)
  }, [displayText, isDeleting, loopNum])

  useEffect(() => {
    const getUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setAuth(false);
          return;
        }
  
        const response = await fetch(getApiUrl(API_ENDPOINTS.userProfile), {
          method: "GET",
          headers: { 
            token: token
          }
        });
  
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
  
        const parseRes = await response.json();
        setUserData(parseRes);
      } catch (err) {
        console.error(err.message);
        setAuth(false);
        localStorage.removeItem("token");
      }
    };
  
    if (isAuthenticated) {
      getUserData();
    } else {
      setUserData(null);
    }
  }, [isAuthenticated, setAuth]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.querySelector('input');
    const query = searchInput.value.trim();
    
    if (query) {
      navigate(`/orders?q=${encodeURIComponent(query)}`);
    }
  };

  useEffect(() => {
    const status = localStorage.getItem("acceptingOrders") !== "false";
    setIsAcceptingOrders(status);

    const handler = () => {
      setIsAcceptingOrders(localStorage.getItem("acceptingOrders") !== "false");
    };

    window.addEventListener("orderAcceptanceChanged", handler);
    return () => window.removeEventListener("orderAcceptanceChanged", handler);
  }, []);

  const tick = () => {
    let i = loopNum % items.length
    let fullText = items[i]
    let updatedText = isDeleting
      ? fullText.substring(0, displayText.length - 1)
      : fullText.substring(0, displayText.length + 1)

    setDisplayText(updatedText)

    if (!isDeleting && updatedText === fullText) {
      setTimeout(() => setIsDeleting(true), period)
    } else if (isDeleting && updatedText === '') {
      setIsDeleting(false)
      setLoopNum(loopNum + 1)
    }
  }

  const categories = [
    { name: "Brownie", path: "/category/Brownie" },
    { name: "Cake", path: "/category/Cake" },
    { name: "Cake Pops", path: "/category/Cake%20Pops" },
    { name: "Cheesecake", path: "/category/Cheesecake" },
    { name: "Cookies", path: "/category/Cookies" },
    { name: "Donut", path: "/category/Donut" },
    { name: "Ice Cream", path: "/category/Ice%20Cream" },
    { name: "Modak", path: "/category/Modak" },
    { name: "Swiss Roll", path: "/category/Swiss%20Roll" },
    { name: "Hampers", path: "/hampers" },
    { name: "See All", path: "/orders" },
    { name: "Track Order", path: "/track-order" },
  ];
  

  return (
    <header className="sticky top-0 z-50">
      {!isAcceptingOrders && (
        <div className="bg-red-500 text-white text-center py-2 text-sm sm:text-base">
          We're currently not accepting orders. Please check back later.
        </div>
      )}

      <div className="bg-[#f0adbc]">
        <div className="container mx-auto px-4 py-3 border-b border-[#f8bbd0]">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Section - Responsive */}
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src="/images/Logo.png"
                  alt="Bindi's Cupcakery"
                  className="h-8 w-8 sm:h-12 sm:w-12 object-contain"
                />
                <img
                  src="/images/Name.png"
                  alt="Bindi's Cupcakery"
                  className="h-6 sm:h-8 object-contain hidden sm:block"
                />
              </div>
            </Link>

            <MobileHeader 
              showMobileSearch={showMobileSearch}
              setShowMobileSearch={setShowMobileSearch}
              isAuthenticated={isAuthenticated}
              setIsProfileOpen={setIsProfileOpen}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Search Section - Hide on mobile */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4 relative group">
              <form onSubmit={handleSearch} className="w-full">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-[#dcc8b7] 
                           bg-white focus:outline-none focus:border-pink-500 
                           transition-colors duration-200 group-hover:border-pink-400 
                           text-black placeholder-black appearance-none"
                  placeholder={`Search for ${displayText}${!isDeleting ? '|' : ''}`}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 
                           text-black hover:text-pink-500 transition-colors duration-200"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Navigation Section - Desktop */}
            <nav className="hidden lg:flex items-center gap-6 flex-shrink-0">
              <Link to="/orders" className="nav-link">
                <CakeSlice className="h-5 w-5" />
                <span>Products</span>
              </Link>
              <Link to="/hampers" className="nav-link">
                <Grid className="h-5 w-5" />
                <span>Hampers</span>
              </Link>
              <Link to="/cart" className="nav-link">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
              </Link>

              {/* User Profile Section */}
              {isAuthenticated && userData ? (
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsProfileOpen(true)} className="nav-link">
                    <User className="h-5 w-5" />
                    <span>Hello, {userData.user_name}</span>
                  </button>
                </div>
              ) : !isAuthenticated && (
                <Link to="/login" className="nav-link">
                  <LogIn className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {showMobileSearch && (
        <div className="lg:hidden bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 rounded-md border border-gray-300 
                         focus:outline-none focus:border-pink-500"
                placeholder="Search products..."
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-500" />
              </button>
            </form>
          </div>
        </div>
      )}

      <MobileMenu 
        categories={categories}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Category Navigation - Desktop */}
      <div className="bg-pink-50 hidden md:block">
        <div className="container mx-auto px-4 overflow-x-auto">
          <nav className="flex justify-start md:justify-center space-x-4 md:space-x-8 py-2">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="whitespace-nowrap py-3 text-black hover:text-pink-500 
                         transition-colors duration-200 group text-sm font-medium"
              >
                {category.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-pink-500 
                             transform scale-x-0 group-hover:scale-x-100 
                             transition-transform duration-200" />
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* User Profile Dialog */}
      <UserProfileDialog 
        isOpen={isProfileOpen}
        setIsOpen={setIsProfileOpen}
        userData={userData}
        onLogout={() => {
          localStorage.removeItem("token");
          setAuth(false);
          setIsMobileMenuOpen(false);
        }}
      />
    </header>
  )
}

// Add these styles to your global CSS or Tailwind config
const styles = {
  navLink: `flex items-center gap-1 text-black hover:text-[#d81b60] 
           transition-colors duration-200`
}

export default Navbar;