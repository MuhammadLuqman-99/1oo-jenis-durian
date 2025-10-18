import { Award, Heart, Leaf, Truck } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <Leaf className="text-tropical-lime" size={40} />,
      title: "100% Organic",
      description: "All our durians are grown naturally without harmful pesticides or chemicals.",
    },
    {
      icon: <Award className="text-primary-500" size={40} />,
      title: "Premium Quality",
      description: "Hand-picked at peak ripeness to ensure the best taste and texture.",
    },
    {
      icon: <Truck className="text-blue-500" size={40} />,
      title: "Fast Delivery",
      description: "Fresh durians delivered directly from our farms to your home.",
    },
    {
      icon: <Heart className="text-red-500" size={40} />,
      title: "Customer First",
      description: "Your satisfaction is our priority. We guarantee quality in every fruit.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title mb-4">Why Choose Us?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are passionate about bringing you the finest Malaysian durians.
            With over 100 varieties and decades of expertise, we deliver excellence in every fruit.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="card p-8 text-center hover:transform hover:scale-105 transition-all"
            >
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  For over 20 years, <span className="font-semibold text-tropical-green">100 Jenis Durian</span> has been
                  Malaysia's trusted name in premium durian supply. What started as a small family farm has
                  grown into a comprehensive durian orchard featuring over 100 unique varieties.
                </p>
                <p>
                  From the legendary Musang King to rare exotic varieties, we cultivate each fruit with
                  traditional farming methods passed down through generations, combined with modern
                  agricultural innovations.
                </p>
                <p className="font-semibold text-tropical-green">
                  Our mission: To share the incredible diversity and rich flavors of Malaysian durian
                  with enthusiasts around the world.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-400 to-orange-400 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-9xl">🌳</div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-4">
                <div className="text-2xl font-bold text-tropical-green">20+</div>
                <div className="text-sm text-gray-600">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
