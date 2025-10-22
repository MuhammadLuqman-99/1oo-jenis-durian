'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Truck, MapPin } from 'lucide-react';
import { ShoppingCart, ShippingAddress } from '@/types/tree';
import { getCart, validateCart, updateShippingCost, calculateShippingCost } from '@/lib/cartService';
import { createOrderFromCart } from '@/lib/orderService';
import { showSuccess, showError } from '@/lib/toast';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [processing, setProcessing] = useState(false);

  // Customer Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postcode, setPostcode] = useState('');

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');

  // Notes
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    if (cart) {
      const cost = calculateShippingCost(cart.subtotal, shippingMethod);
      const updated = updateShippingCost(cost);
      setCart(updated);
    }
  }, [shippingMethod]);

  const loadCart = () => {
    const currentCart = getCart();
    if (currentCart.items.length === 0) {
      router.push('/shop/cart');
      return;
    }
    setCart(currentCart);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart) return;

    // Validate cart
    const validation = await validateCart();
    if (!validation.isValid) {
      showError(validation.errors[0]);
      return;
    }

    setProcessing(true);

    try {
      // Create shipping address
      const shippingAddress: ShippingAddress = {
        id: `addr_${Date.now()}`,
        label: 'Home',
        recipientName: name,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        postcode,
        country: 'Malaysia',
        isDefault: true,
      };

      // Create order
      const result = await createOrderFromCart(
        cart,
        { name, email, phone },
        shippingAddress,
        shippingMethod,
        'curlec',
        customerNotes
      );

      if (!result) {
        showError('Failed to create order');
        setProcessing(false);
        return;
      }

      // Create payment with Curlec
      const paymentResponse = await fetch('/api/curlec/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: result.orderId,
          orderData: result.order,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (paymentData.success && paymentData.paymentUrl) {
        // Redirect to Curlec payment page
        window.location.href = paymentData.paymentUrl;
      } else {
        showError(paymentData.error || 'Failed to initialize payment');
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      showError(error.message || 'Failed to process checkout');
      setProcessing(false);
    }
  };

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const malaysianStates = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan',
    'Pahang', 'Penang', 'Perak', 'Perlis', 'Sabah', 'Sarawak',
    'Selangor', 'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/shop/cart"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Checkout</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="mr-2" size={20} />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="John Tan"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+60123456789"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Truck className="mr-2" size={20} />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine1}
                      onChange={(e) => setAddressLine1(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123 Jalan Durian"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      value={addressLine2}
                      onChange={(e) => setAddressLine2(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Apartment, suite, etc. (optional)"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Penang"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        required
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="10000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <select
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Select a state</option>
                      {malaysianStates.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      name="shipping"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Standard Delivery</div>
                      <div className="text-sm text-gray-600">3-5 business days</div>
                    </div>
                    <div className="font-semibold">
                      {cart.subtotal >= 150 ? 'FREE' : 'RM 10.00'}
                    </div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      name="shipping"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Express Delivery</div>
                      <div className="text-sm text-gray-600">1-2 business days</div>
                    </div>
                    <div className="font-semibold">RM 20.00</div>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 transition-colors">
                    <input
                      type="radio"
                      name="shipping"
                      value="pickup"
                      checked={shippingMethod === 'pickup'}
                      onChange={() => setShippingMethod('pickup')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium">Self Pickup</div>
                      <div className="text-sm text-gray-600">Pick up from our farm</div>
                    </div>
                    <div className="font-semibold">FREE</div>
                  </label>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Special Instructions</h2>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Any special requests or delivery instructions..."
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map(item => (
                    <div key={item.productId} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-yellow-100 rounded flex items-center justify-center text-2xl flex-shrink-0">
                        🥭
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-sm">RM {item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pt-4 border-t">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>RM {cart.subtotal.toFixed(2)}</span>
                  </div>

                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({cart.discountCode})</span>
                      <span>-RM {cart.discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Tax (6% SST)</span>
                    <span>RM {cart.tax.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {cart.shippingCost === 0 ? (
                        <span className="text-green-600 font-medium">FREE</span>
                      ) : (
                        `RM ${cart.shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">RM {cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2" size={20} />
                      Pay with Curlec
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Secure payment powered by Curlec
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
