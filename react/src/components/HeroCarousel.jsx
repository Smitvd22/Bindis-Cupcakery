"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const carouselItems = [
  {
    image: "/images/Carousel1.png",
    link: "/category/Donut",
  },
  {
    image: "/images/Carousel2.png",
    link: "/category/Cake",
  },
  {
    image: "/images/Carousel3.png",
    link: "https://example.com/link3",
  },
  {
    image: "/images/Carousel4.png",
    link: "https://example.com/link4",
  },
];

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = (e) => {
    e.stopPropagation(); // Prevent triggering the link click
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const prevSlide = (e) => {
    e.stopPropagation(); // Prevent triggering the link click
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  };

  const handleSlideClick = () => {
    window.open(carouselItems[currentIndex].link, "_blank");
  };

  return (
    <div className="bg-pink-50 py-4 sm:py-8">
      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Aspect ratio container */}
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          {/* (500/1280 * 100) */}
          <div className="absolute inset-0 rounded-xl sm:rounded-3xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }} // Fixed transition prop
                className="absolute inset-0 cursor-pointer"
                onClick={handleSlideClick}
              >
                <img
                  src={carouselItems[currentIndex].image || "/placeholder.svg"}
                  alt={`Slide ${currentIndex + 1}`}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-pink-50 
                         hover:bg-pink transition-all duration-300 flex items-center justify-center
                         opacity-0 group-hover:opacity-100 shadow-lg z-10"
              onClick={prevSlide}
            >
              <span className="text-2xl text-gray-800">←</span>
            </button>

            <button
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-pink-50 
                         hover:bg-pink transition-all duration-300 flex items-center justify-center
                         opacity-0 group-hover:opacity-100 shadow-lg z-10"
              onClick={nextSlide}
            >
              <span className="text-2xl text-gray-800">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-3 mt-6">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 
                       ${index === currentIndex ? "bg-pink-500" : "bg-pink-200"}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
          />
        ))}
      </div>
    </div>
  );
}