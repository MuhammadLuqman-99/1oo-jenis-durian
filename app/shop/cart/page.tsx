'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Minus, Trash2, Tag, ShoppingBag } from 'lucide-react';
import { ShoppingCart } from '@/types/tree';
import {
  getCart,
  updateCartItemQuantity,
  removeFromCart,
  applyDiscountCode,
  removeDiscountCode,
} from '@/lib/cartService';
import { showSuccess, showError } from '@/lib/toast';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<ShoppingCart | null>(null);
  const [discountInput, setDiscountInput] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const currentCart = getCart();
    setCart(currentCart);
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    try {
      const updated = updateCartItemQuantity(productId, newQuantity);
      setCart(updated);
      showSuccess('Cart updated');
    } catch (error: any) {
      showError(error.message || 'Failed to update cart');
    }
  };

  const handleRemoveItem = (productId: string) => {
    try {
      const updated = removeFromCart(productId);
      setCart(updated);
      showSuccess('Item removed from cart');
    } catch (error: any) {
      showError(error.message || 'Failed to remove item');
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountInput.trim()) {
      showError('Please enter a discount code');
      return;
    }

    setApplyingDiscount(true);
    try {
      const result = await applyDiscountCode(discountInput.trim().toUpperCase());
      if (result.success && result.cart) {
        setCart(result.cart);
        showSuccess(result.message);
        setDiscountInput('');
      } else {
        showError(result.message);
      }
    } catch (error: any) {
      showError(error.message || 'Failed to apply discount');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    const updated = removeDiscountCode();
    setCart(updated);
    showSuccess('Discount code removed');
  };

  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const isEmpty = cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link
              href="/shop"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold">Shopping Cart</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEmpty ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Add some delicious durians to get started!
            </p>
            <Link
              href="/shop"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-xl shadow-sm p-6 flex items-center space-x-4"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.product.images && item.product.images[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-4xl">🥭</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">{item.product.variety}</p>
                    <p className="text-green-600 font-medium mt-1">
                      RM {item.price.toFixed(2)}/{item.product.unit}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} className={item.quantity <= 1 ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                      disabled={item.quantity >= item.product.stockQuantity}
                    >
                      <Plus size={16} className={item.quantity >= item.product.stockQuantity ? 'text-gray-300' : 'text-gray-600'} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right w-24">
                    <p className="font-semibold text-gray-900">
                      RM {item.subtotal.toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                {/* Discount Code */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount Code
                  </label>
                  {cart.discountCode ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Tag size={16} className="text-green-600" />
                        <span className="font-medium text-green-900">{cart.discountCode}</span>
                      </div>
                      <button
                        onClick={handleRemoveDiscount}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={discountInput}
                        onChange={(e) => setDiscountInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                        placeholder="Enter code"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={handleApplyDiscount}
                        disabled={applyingDiscount}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Try: WELCOME10 or SAVE20
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>RM {cart.subtotal.toFixed(2)}</span>
                  </div>

                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
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

                  {cart.subtotal < 150 && cart.shippingCost === 0 && (
                    <p className="text-xs text-gray-500">
                      Add RM {(150 - cart.subtotal).toFixed(2)} more for free shipping
                    </p>
                  )}

                  <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">RM {cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/shop/checkout"
                  className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/shop"
                  className="block w-full text-center py-3 text-gray-600 hover:text-gray-900 transition-colors mt-2"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
