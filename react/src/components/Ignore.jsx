"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import HeroCarousel from "./HeroCarousel"
import CategoryNav from "./CategoryNav"
import ProductSection from "./ProductSection"
import AboutUs from "./AboutUs"
import Reviews from "./Reviews"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroCarousel />
      <div className="relative z-10">
        <CategoryNav />
      </div>
      {/* Reduced gap by overriding padding */}
      <div className="relative z-20 -mt-8"> {/* Adjusted margin-top */}
        <ProductSection title="Our Bestsellers" products={bestsellers} />
      </div>
      <div className="relative z-20 -mt-8"> {/* Adjusted margin-top */}
        <ProductSection title="New Additions" products={newAdditions} />
      </div>
      <div className="relative z-20 -mt-8"> {/* Adjusted margin-top */}
        <AboutUs />
      </div>
      <div className="relative z-20 -mt-8"> {/* Adjusted margin-top */}
        <Reviews />
      </div>
    </div>
  )
}

const bestsellers = [
  {
    id: 1,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  },
  {
    id: 2,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  },
  {
    id: 3,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  },
  {
    id: 4,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  },
  {
    id: 5,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  }
  // Add more products...
]

const newAdditions = [
  {
    id: 1,
    name: "Rainbow Cake",
    image: "/placeholder.svg",
    price: "$24.99",
  },
  {
    id: 2,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  },
  {
    id: 3,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  },
  {
    id: 4,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  },
  {
    id: 5,
    name: "Classic Vanilla Cupcake",
    image: "/placeholder.svg",
    price: "$3.99",
  }
  // Add more products...
]