"use client";

import { ArrowRight, Star } from "lucide-react";

export default function Hero() {

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-tropical-green via-green-700 to-tropical-brown">
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white">
            <Star className="text-primary-300" fill="currentColor" size={18} />
            <span className="text-sm font-semibold">Premium Malaysian Durian</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white text-shadow-lg">
            <span className="block">Discover the</span>
            <span className="block text-primary-300">King of Fruits</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-gray-100 max-w-3xl mx-auto text-shadow">
            Experience over 100 varieties of premium Malaysian durian.
            <span className="block mt-2">Fresh from our farms, delivered to your doorstep.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <a
              href="#products"
              className="btn-primary inline-flex items-center space-x-2 text-lg group"
            >
              <span>Explore Our Collection</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#contact"
              className="btn-secondary inline-flex items-center space-x-2 text-lg"
            >
              <span>Contact Us</span>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto pt-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-300">100+</div>
              <div className="text-sm md:text-base text-gray-200 mt-2">Durian Varieties</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-300">1000+</div>
              <div className="text-sm md:text-base text-gray-200 mt-2">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary-300">20+</div>
              <div className="text-sm md:text-base text-gray-200 mt-2">Years Experience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
