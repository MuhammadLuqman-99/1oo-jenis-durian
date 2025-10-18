import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-tropical-green to-tropical-brown text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">🌿</span>
              <h3 className="text-xl font-bold">100 Jenis Durian</h3>
            </div>
            <p className="text-gray-200 text-sm">
              Your trusted source for premium Malaysian durian. Over 100 varieties of the finest quality fruits.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="text-gray-200 hover:text-primary-300 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-200 hover:text-primary-300 transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#products" className="text-gray-200 hover:text-primary-300 transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#contact" className="text-gray-200 hover:text-primary-300 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/admin/login" className="text-primary-300 hover:text-primary-100 transition-colors font-semibold">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" />
                <span className="text-gray-200">Penang, Malaysia</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={18} className="flex-shrink-0" />
                <span className="text-gray-200">+60 12-345 6789</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} className="flex-shrink-0" />
                <span className="text-gray-200">info@100jenisdurian.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-200">
                Fresh durian delivered daily from our farms to your doorstep.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-gray-200">
          <p>&copy; {new Date().getFullYear()} 100 Jenis Durian. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
