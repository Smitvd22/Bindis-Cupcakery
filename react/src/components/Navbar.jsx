import { Store, Search, Package2, History, CakeSlice, ShoppingCart, User, LogIn, Grid } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import UserProfileDialog from '../components/UserProfileDialog'
import { getApiUrl, API_ENDPOINTS } from '../config/api';

function Navbar({ isAuthenticated, setAuth, userName, userEmail, userPhone }) {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [userData, setUserData] = useState(null);
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
    { name: "Truffle Balls", path: "/category/Truffle%20Balls" },
    { name: "Hampers", path: "/hampers" },
    { name: "See All", path: "/orders" },
    { name: "Track Order", path: "/track-order" },
  ];
  

  return (
    <header className="sticky top-0 z-50">
      {!isAcceptingOrders && (
        <div className="bg-red-500 text-white text-center py-2">
          We're currently not accepting orders. Please check back later.
        </div>
      )}

      <div className="bg-[#f0adbc]">
        <div className="container mx-auto px-4 py-3 border-b border-[#f8bbd0]">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Section */}
            <Link to="/" className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <img
                  src="/images/Logo.png"
                  alt="Bindi's Cupcakery"
                  className="h-12 w-12 object-contain"
                />
                <img
                  src="/images/Name.png"
                  alt="Bindi's Cupcakery"
                  className="h-8 object-contain"
                />
              </div>
            </Link>

            {/* Search Section */}
            <div className="flex-1 max-w-xl mx-4 relative group">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-md border border-[#dcc8b7] 
                  bg-white focus:outline-none focus:border-pink-500 
                  transition-colors duration-200
                  group-hover:border-pink-400 text-black placeholder-black
                  appearance-none"
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

            {/* Navigation Section - Reordered */}
            <nav className="flex items-center gap-6 flex-shrink-0">
              {/* Products Link */}
              <Link
                to="/orders"
                className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                         transition-colors duration-200"
              >
                <CakeSlice className="h-5 w-5" />
                <span className="hidden sm:inline">Products</span>
              </Link>

              {/* Hampers Link */}
              <Link
                to="/hampers"
                className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                         transition-colors duration-200"
              >
                <Grid className="h-5 w-5" />
                <span className="hidden sm:inline">Hampers</span>
              </Link>

              {/* Cart Link */}
              <Link
                to="/cart"
                className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                         transition-colors duration-200"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="hidden sm:inline">Cart</span>
              </Link>

              {/* User Profile Section*/}
              {isAuthenticated && userData ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsProfileOpen(true)}
                  className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                            transition-colors duration-200"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">
                    Hello, {userData.user_name}
                  </span>
                </button>
                <UserProfileDialog 
                  isOpen={isProfileOpen}
                  setIsOpen={setIsProfileOpen}
                  userData={userData}
                  onLogout={() => {
                    localStorage.removeItem("token");
                    setAuth(false);
                  }}
                />
              </div>
            ) : isAuthenticated ? (
              <div className="flex items-center">
                <span className="text-gray-600">Loading...</span>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                        transition-colors duration-200"
              >
                <LogIn className="h-5 w-5" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            </nav>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-pink-50">
        <div className="container mx-auto px-4">
          <nav className="flex justify-center space-x-8">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.path}
                className="relative py-3 text-black hover:text-pink-500 transition-colors duration-200 
                           group text-sm font-medium"
              >
                {category.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-pink-500 transform scale-x-0 
                                 group-hover:scale-x-100 transition-transform duration-200" />
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Navbar;