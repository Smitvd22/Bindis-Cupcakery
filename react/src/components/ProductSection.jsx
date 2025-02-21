import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";

export default function ProductSection({ title, products = [], loading = false, error = null }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const formatPrice = (price) => {
    return `₹${parseFloat(price).toFixed(2)}`;
  };

  console.log("ProductSection Props:", { title, products, loading, error });

  if (loading) {
    return (
      <section className="py-20 bg-pink-50">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
            <div className="h-10 w-24 bg-gray-200 rounded"></div> {/* Placeholder for button */}
          </div>
          <div className="relative px-14">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse">
                  <div className="bg-white rounded-lg h-80">
                    <div className="h-56 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-pink-50">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
        </div>
      </section>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="py-20 bg-pink-50">
        <div className="container mx-auto px-8 max-w-7xl">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          </div>
          <div className="text-gray-500 text-center py-8">No products available at the moment.</div>
        </div>
      </section>
    );
  }
  
  const sectionUrlName = title.split(" ").join("-").toLowerCase();

  return (
    <section className="py-20 bg-pink-50">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
          <Link to={`/category/${sectionUrlName}`}>
            <motion.button
              className="px-6 py-2 bg-pink-200 text-gray-800 border border-pink-300 rounded-md hover:bg-pink-300 hover:text-gray-900 transition-colors duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              See All
            </motion.button>
          </Link>
        </div>

        <div className="relative px-14">
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                className="flex-none w-72 bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer"
                whileHover={{ y: -5 }}
                onClick={() => window.open(`/product/${product.id}`, "_blank")}
              >
                <div className="relative h-56">
                  <img
                    src={product.image_url || "/api/placeholder/300/300"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-gray-800 text-lg">{product.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-pink-500 font-medium text-lg">{formatPrice(product.price)}</p>
                    {product.rating && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-800 text-sm">
                        ★ {product.rating}
                      </span>
                    )}
                  </div>
                  {product.review_count > 0 && <p className="text-sm text-gray-500 mt-1">({product.review_count} Reviews)</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {products.length > 4 && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-7 h-7 text-gray-600" />
              </button>

              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-7 h-7 text-gray-600" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
  