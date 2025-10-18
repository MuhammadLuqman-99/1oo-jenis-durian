"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, User, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: string;
  variety: string;
  price: number;
  quantity: number;
  weight: string;
}

export default function OrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Sample durian varieties with prices (RM per kg)
  const durianVarieties = [
    { id: "d197", name: "Musang King (D197)", price: 88, description: "Premium quality, creamy texture" },
    { id: "d200", name: "Black Thorn (D200)", price: 75, description: "Rich, bitter-sweet flavor" },
    { id: "d24", name: "D24 Sultan", price: 45, description: "Sweet and creamy" },
    { id: "d175", name: "Red Prawn (D175)", price: 55, description: "Distinctive orange flesh" },
  ];

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postcode: "",
    state: "Johor",
  });

  const addToOrder = (variety: typeof durianVarieties[0]) => {
    const existing = orderItems.find(item => item.id === variety.id);

    if (existing) {
      setOrderItems(orderItems.map(item =>
        item.id === variety.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        id: variety.id,
        variety: variety.name,
        price: variety.price,
        quantity: 1,
        weight: "1 kg"
      }]);
    }
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setOrderItems(orderItems.filter(item => item.id !== id));
    } else {
      setOrderItems(orderItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert("Please add items to your order");
      return;
    }

    setLoading(true);

    try {
      // Prepare order data
      const orderData = {
        customer: customerInfo,
        items: orderItems,
        total: calculateTotal(),
        currency: "MYR",
        timestamp: new Date().toISOString(),
      };

      // Call Curlec payment API
      const response = await fetch("/api/curlec/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success && data.paymentUrl) {
        // Redirect to Curlec payment page
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || "Payment creation failed");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert("Error processing order. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-tropical-green to-tropical-lime text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order Premium Durians</h1>
              <p className="text-gray-100 mt-1">Fresh from our farm to your doorstep</p>
            </div>
            <Link
              href="/"
              className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Product Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <ShoppingCart size={24} className="text-tropical-green" />
                <span>Select Durian Varieties</span>
              </h2>

              <div className="space-y-4">
                {durianVarieties.map((variety) => (
                  <div
                    key={variety.id}
                    className="border-2 border-gray-200 rounded-lg p-4 hover:border-tropical-lime transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">{variety.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{variety.description}</p>
                        <p className="text-2xl font-bold text-tropical-green mt-2">
                          RM {variety.price} <span className="text-sm text-gray-600">/ kg</span>
                        </p>
                      </div>
                      <button
                        onClick={() => addToOrder(variety)}
                        className="ml-4 bg-tropical-lime hover:bg-tropical-green text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Order</h2>

              {orderItems.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items added yet</p>
              ) : (
                <div className="space-y-3">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{item.variety}</p>
                        <p className="text-sm text-gray-600">RM {item.price} / kg</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <span className="font-semibold w-8 text-center">{item.quantity} kg</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-tropical-lime hover:bg-tropical-green text-white rounded-full flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-gray-900 ml-4 w-24 text-right">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}

                  <div className="border-t-2 border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-900">Total:</span>
                      <span className="text-3xl font-bold text-tropical-green">
                        RM {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Customer Information & Payment */}
          <div className="space-y-6">
            <form onSubmit={handleSubmitOrder} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <User size={24} className="text-tropical-green" />
                <span>Customer Information</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                    placeholder="Ahmad bin Abdullah"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="inline mr-1" size={16} /> Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                    placeholder="ahmad@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="inline mr-1" size={16} /> Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                    placeholder="012-345 6789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="inline mr-1" size={16} /> Delivery Address *
                  </label>
                  <textarea
                    required
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none resize-none"
                    placeholder="No. 123, Jalan Durian, Taman Buah"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                      placeholder="Johor Bahru"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Postcode *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerInfo.postcode}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, postcode: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                      placeholder="81300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    required
                    value={customerInfo.state}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-tropical-lime focus:outline-none"
                  >
                    <option value="Johor">Johor</option>
                    <option value="Kedah">Kedah</option>
                    <option value="Kelantan">Kelantan</option>
                    <option value="Melaka">Melaka</option>
                    <option value="Negeri Sembilan">Negeri Sembilan</option>
                    <option value="Pahang">Pahang</option>
                    <option value="Penang">Penang</option>
                    <option value="Perak">Perak</option>
                    <option value="Perlis">Perlis</option>
                    <option value="Selangor">Selangor</option>
                    <option value="Terengganu">Terengganu</option>
                    <option value="Sabah">Sabah</option>
                    <option value="Sarawak">Sarawak</option>
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard size={20} className="text-tropical-green" />
                  <span>Payment Method</span>
                </h3>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white rounded-lg p-2">
                      <img
                        src="https://curlec.com/wp-content/uploads/2021/03/curlec-logo-dark.svg"
                        alt="Curlec"
                        className="h-8"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='40'%3E%3Ctext x='10' y='25' font-family='Arial' font-size='18' fill='%234F46E5'%3ECurlec%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Secure Online Banking (FPX)</p>
                      <p className="text-sm text-gray-600">Pay with your Malaysian bank account</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Supported banks: Maybank, CIMB, Public Bank, RHB, Hong Leong, AmBank, and more...
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || orderItems.length === 0}
                className="w-full mt-6 flex items-center justify-center space-x-2 bg-gradient-to-r from-tropical-green to-tropical-lime hover:from-tropical-lime hover:to-tropical-green text-white font-bold px-6 py-4 rounded-lg transition-all shadow-lg text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={24} />
                    <span>Proceed to Payment (RM {calculateTotal().toFixed(2)})</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                🔒 Secure payment powered by Curlec. Your payment information is encrypted and secure.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
