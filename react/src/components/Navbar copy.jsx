import { Store, Search, Package2, ShoppingCart, User } from "lucide-react"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"

export default function Navbar() {
  const [displayText, setDisplayText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [loopNum, setLoopNum] = useState(0)
  const items = ["cupcake", "cake", "icecream", "brownie", "donut"]
  const period = 2000
  const delta = 200

  useEffect(() => {
    let ticker = setInterval(() => {
      tick()
    }, delta)

    return () => clearInterval(ticker)
  }, [displayText, isDeleting, loopNum])

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
    { name: "Cookies", path: "/cookies" },
    { name: "Cakes", path: "/cakes" },
    { name: "Cupcakes", path: "/cupcakes" },
    { name: "Donuts", path: "/donuts" },
    { name: "Brownie", path: "/brownie" },
    { name: "See All", path: "/products" },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#fce4ec] ">
      <div className="container mx-auto px-4 py-3 border-b border-[#f8bbd0]">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Section */}
          <Link to="/" className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <img
                src="./assests/images/Logo.jpg"
                alt="Bindi's Cupcakery"
                className="h-12 w-12 object-contain rounded-full"
              />
              <img
                src="/path-to-your-text-logo.jpg"
                alt="Bindi's Cupcakery"
                className="h-8 object-contain"
              />
            </div>
          </Link>

          {/* Search Section */}
          <div className="flex-1 max-w-xl mx-4 relative group">
            <input
              type="text"
              className="w-full px-4 py-2 rounded-md border border-[#dcc8b7] 
              bg-[#dcc8b7] focus:outline-none focus:border-pink-500 
              transition-colors duration-200
              group-hover:border-pink-400 text-black placeholder-black
              appearance-none"
              placeholder={`Search for ${displayText}${!isDeleting ? '|' : ''}`}
            />
            <button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
              text-black hover:text-pink-500 transition-colors duration-200"
              onClick={() => {/* Your search function */ }}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <nav className="flex items-center gap-6 flex-shrink-0">
            <Link
              to="/track"
              className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                       transition-colors duration-200"
            >
              <Package2 className="h-5 w-5" />
              <span className="hidden sm:inline">Track Order</span>
            </Link>

            <Link
              to="/cart"
              className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                       transition-colors duration-200"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:inline">Cart</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-1 text-black hover:text-[#d81b60] 
                       transition-colors duration-200"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">Login</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-[#fff8f2]">
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
