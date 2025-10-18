"use client";

import { useState } from "react";
import { X, ZoomIn } from "lucide-react";

interface GalleryImage {
  id: number;
  category: string;
  title: string;
  description: string;
  emoji: string;
  gradient: string;
}

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const images: GalleryImage[] = [
    {
      id: 1,
      category: "varieties",
      title: "Musang King",
      description: "The king of all durians with golden flesh",
      emoji: "👑",
      gradient: "from-yellow-400 to-orange-500",
    },
    {
      id: 2,
      category: "varieties",
      title: "Black Thorn",
      description: "Premium variety with velvety texture",
      emoji: "⚫",
      gradient: "from-gray-700 to-gray-900",
    },
    {
      id: 3,
      category: "farm",
      title: "Our Durian Farm",
      description: "Sustainable farming practices",
      emoji: "🌳",
      gradient: "from-green-400 to-green-600",
    },
    {
      id: 4,
      category: "varieties",
      title: "Red Prawn",
      description: "Distinctive orange-red flesh",
      emoji: "🦐",
      gradient: "from-orange-400 to-red-500",
    },
    {
      id: 5,
      category: "harvest",
      title: "Fresh Harvest",
      description: "Hand-picked at peak ripeness",
      emoji: "🌾",
      gradient: "from-amber-400 to-yellow-600",
    },
    {
      id: 6,
      category: "farm",
      title: "Organic Orchard",
      description: "100+ varieties growing naturally",
      emoji: "🍃",
      gradient: "from-lime-400 to-green-500",
    },
    {
      id: 7,
      category: "varieties",
      title: "D24 Premium",
      description: "Classic choice with creamy texture",
      emoji: "🥇",
      gradient: "from-yellow-300 to-amber-500",
    },
    {
      id: 8,
      category: "harvest",
      title: "Quality Check",
      description: "Every fruit inspected for quality",
      emoji: "✅",
      gradient: "from-blue-400 to-indigo-600",
    },
    {
      id: 9,
      category: "farm",
      title: "Durian Trees",
      description: "Mature trees over 20 years old",
      emoji: "🌴",
      gradient: "from-teal-400 to-emerald-600",
    },
  ];

  const categories = [
    { id: "all", name: "All Photos" },
    { id: "varieties", name: "Durian Varieties" },
    { id: "farm", name: "Our Farm" },
    { id: "harvest", name: "Harvest & Quality" },
  ];

  const filteredImages =
    selectedCategory === "all"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  return (
    <section id="gallery" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Our Gallery</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our beautiful collection of premium durians, sustainable farms,
            and the journey from tree to table.
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
                  ? "bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              {/* Image Placeholder with Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${image.gradient} flex items-center justify-center`}
              >
                <div className="text-9xl transform group-hover:scale-110 transition-transform duration-300">
                  {image.emoji}
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{image.title}</h3>
                  <p className="text-gray-200 text-sm">{image.description}</p>
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-3 rounded-full">
                  <ZoomIn className="text-white" size={24} />
                </div>
              </div>

              {/* Category Badge */}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 capitalize">
                {image.category}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredImages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-xl text-gray-600">No photos in this category yet.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Visit Our Farm
          </h3>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Want to see our durian farm in person? Schedule a visit and experience
            the journey from tree to table. Perfect for durian enthusiasts!
          </p>
          <a href="#contact" className="btn-primary inline-flex items-center space-x-2">
            <span>Schedule Farm Visit</span>
          </a>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 rounded-full transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="text-white" size={32} />
          </button>

          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Large Image Display */}
            <div
              className={`aspect-video rounded-2xl bg-gradient-to-br ${selectedImage.gradient} flex items-center justify-center shadow-2xl mb-6`}
            >
              <div className="text-[200px]">{selectedImage.emoji}</div>
            </div>

            {/* Image Info */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3 capitalize">
                    {selectedImage.category}
                  </div>
                  <h3 className="text-4xl font-bold mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-xl text-gray-200">
                    {selectedImage.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
