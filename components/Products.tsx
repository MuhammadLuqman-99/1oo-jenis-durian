"use client";

import { ShoppingCart, Star, TrendingUp } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface Product {
  id: number;
  name: string;
  variety: string;
  price: string;
  rating: number;
  description: string;
  features: string[];
  popular: boolean;
  emoji: string;
}

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const products: Product[] = [
    {
      id: 1,
      name: "Musang King",
      variety: "D197",
      price: "RM 55/kg",
      rating: 5,
      description: "The undisputed king with rich, creamy texture and bitter-sweet taste.",
      features: ["Premium Grade", "Creamy", "Bitter-Sweet"],
      popular: true,
      emoji: "👑",
    },
    {
      id: 2,
      name: "Black Thorn",
      variety: "D200",
      price: "RM 48/kg",
      rating: 5,
      description: "Velvety smooth texture with a balanced sweet flavor profile.",
      features: ["Premium Grade", "Smooth", "Sweet"],
      popular: true,
      emoji: "⚫",
    },
    {
      id: 3,
      name: "D24",
      variety: "D24",
      price: "RM 28/kg",
      rating: 4,
      description: "Classic choice with creamy flesh and sweet taste.",
      features: ["Best Value", "Creamy", "Sweet"],
      popular: true,
      emoji: "🥇",
    },
    {
      id: 4,
      name: "Red Prawn",
      variety: "D175",
      price: "RM 35/kg",
      rating: 4,
      description: "Distinctive orange-red flesh with sweet and slightly bitter notes.",
      features: ["Unique Color", "Sweet", "Aromatic"],
      popular: false,
      emoji: "🦐",
    },
    {
      id: 5,
      name: "XO",
      variety: "D168",
      price: "RM 30/kg",
      rating: 4,
      description: "Smooth texture with alcohol-like fermented taste.",
      features: ["Fermented", "Smooth", "Unique"],
      popular: false,
      emoji: "🍷",
    },
    {
      id: 6,
      name: "Golden Phoenix",
      variety: "D198",
      price: "RM 42/kg",
      rating: 5,
      description: "Golden flesh with rich, creamy texture and sweet taste.",
      features: ["Golden", "Rich", "Sweet"],
      popular: false,
      emoji: "🔆",
    },
  ];

  const categories = [
    { id: "all", name: "All Varieties" },
    { id: "premium", name: "Premium" },
    { id: "popular", name: "Most Popular" },
    { id: "value", name: "Best Value" },
  ];

  return (
    <section id="products" className="py-20 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Our Premium Selection</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our carefully curated collection of the finest durian varieties.
            Each fruit is selected for its exceptional quality and taste.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="card group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              {/* Product Image Area */}
              <div className="relative bg-gradient-to-br from-primary-100 to-orange-100 p-12 flex items-center justify-center">
                {product.popular && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <TrendingUp size={14} />
                    <span>Popular</span>
                  </div>
                )}
                <div className="text-8xl group-hover:scale-110 transition-transform">
                  {product.emoji}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">{product.variety}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {product.price}
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < product.rating
                          ? "text-primary-500 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.rating}.0)
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{product.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Order Button */}
                <button className="w-full bg-gradient-to-r from-tropical-green to-tropical-lime hover:from-tropical-lime hover:to-tropical-green text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-105 shadow-md hover:shadow-lg">
                  <ShoppingCart size={20} />
                  <span>Order Now</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? We have 100+ more varieties!
          </p>
          <a href="#contact" className="btn-primary inline-flex items-center space-x-2">
            <span>Contact Us for Full Catalog</span>
          </a>
        </div>
      </div>
    </section>
  );
}
