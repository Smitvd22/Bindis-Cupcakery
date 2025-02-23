import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";

const categories = [
  { name: "Brownie", href: "/category/Brownie", description: "Freshly Baked Daily", image: "/images/BrownieChocolate.png" },
  { name: "Cakes", href: "/category/Cake", description: "Custom & Signature", image: "/images/CakeChocolateMousse.png" },
  { name: "Cake Pops", href: "/category/Cake%20Pops", description: "Bite-Sized Bliss", image: "/images/CakepopsChocolate.png" },
  { name: "Cheese Cake", href: "/category/Cheesecake", description: "Creamy & Irresistible", image: "/images/CheesecakeBlueberry.png" },
  { name: "Cookies", href: "/category/Cookies", description: "Crunchy Perfection", image: "/images/CookiesDoublechocolatesubway.png" },
  { name: "Donut", href: "/category/Donut", description: "Sweet & Soft Rings", image: "/images/DonutChocolate.png" },
  { name: "Fudge", href: "/category/Fudge", description: "Rich Chocolate Delight", image: "/images/FudgeChocolate.png" },
  { name: "Ice cream", href: "/category/Ice%20Cream", description: "Chilled Happiness", image: "/images/IceCreamBelgianchocolate.png" },
  { name: "Modak", href: "/category/Modak", description: "Traditional Delights", image: "/images/ModakMawa.png" },
  { name: "Swiss Roll", href: "/category/Swiss%20Roll", description: "Soft Rolls, Sweet Swirls", image: "/images/SwissRollChocolate.png" },
  { name: "Truffle balls", href: "/category/Truffle%20Balls", description: "Little Bites of Joy", image: "/images/TruffleballsCoffeecaramel.png" },
  { name: "Hampers", href: "/category/Hampers", description: "Perfect Gift Packages", image: "/images/DessertBoxLarge.png" },
];



export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <nav id="category-section" className="relative py-12 bg-pink-50 isolate">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              style={{ transform: 'translate3d(0, 0, 0)' }}
              className="relative w-full"
            >
              <Link
                to={category.href}
                className="flex flex-col items-center group w-full"
                onMouseEnter={() => setActiveCategory(category.name)}
                onMouseLeave={() => setActiveCategory(null)}
              >
                <div className="w-full aspect-square rounded-2xl bg-white shadow-lg mb-4 overflow-hidden
                             group-hover:shadow-xl transition-all duration-300 relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10
                               transition-colors duration-300" />
                </div>
                <span className="text-base sm:text-lg font-medium text-gray-800 group-hover:text-pink-500
                              transition-colors duration-200">
                  {category.name}
                </span>
                <span className="text-sm text-gray-500 mt-1 opacity-0 group-hover:opacity-100
                              transition-opacity duration-200">
                  {category.description}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </nav>
  );
}