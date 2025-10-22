'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle, Package, Truck, MapPin, CreditCard, Download, Home } from 'lucide-react';
import { CustomerOrder } from '@/types/tree';
import { getOrderById } from '@/lib/orderService';
import { clearCart } from '@/lib/cartService';

interface PageProps {
  params: {
    id: string;
  };
}

export default function OrderSuccessPage({ params }: PageProps) {
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    // Clear cart after successful order
    clearCart();
  }, [params.id]);

  const loadOrder = async () => {
    setLoading(true);
    const orderData = await getOrderById(params.id);
    setOrder(orderData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl shadow-sm p-12 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>
          <Link
            href="/shop"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.paymentStatus === 'paid';
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (order.shippingMethod === 'express' ? 2 : 5));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🥭</span>
            <span className="text-xl font-bold text-gray-900">Durian Shop</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Message */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8 text-center">
          <div className="mb-6">
            <CheckCircle size={80} className="mx-auto text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPaid ? 'Order Confirmed!' : 'Order Received!'}
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            {isPaid
              ? 'Thank you for your purchase. Your payment has been processed successfully.'
              : 'Your order has been placed and is awaiting payment confirmation.'}
          </p>
          <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-sm text-gray-600">Order Number:</span>
            <span className="text-lg font-bold text-green-600">{order.orderNumber}</span>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Status</h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-6">
              {/* Order Placed */}
              <div className="relative flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status !== 'cancelled' ? 'bg-green-600' : 'bg-gray-400'
                }`}>
                  <CheckCircle size={16} className="text-white" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Order Placed</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleString('en-MY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className="relative flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  isPaid ? 'bg-green-600' : order.paymentStatus === 'failed' ? 'bg-red-600' : 'bg-gray-300'
                }`}>
                  <CreditCard size={16} className="text-white" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Payment {isPaid ? 'Confirmed' : 'Pending'}</p>
                  <p className="text-sm text-gray-600">
                    {isPaid ? 'Payment received successfully' :
                     order.paymentStatus === 'failed' ? 'Payment failed - please contact support' :
                     'Waiting for payment confirmation'}
                  </p>
                </div>
              </div>

              {/* Processing */}
              <div className="relative flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
                    ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  <Package size={16} className="text-white" />
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">Processing</p>
                  <p className="text-sm text-gray-600">
                    {order.status === 'processing' ? 'We are preparing your order' :
                     order.status === 'shipped' || order.status === 'delivered' ? 'Order prepared' :
                     'Waiting for payment confirmation'}
                  </p>
                </div>
              </div>

              {/* Shipped */}
              {order.shippingMethod !== 'pickup' && (
                <div className="relative flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    order.status === 'shipped' || order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-300'
                  }`}>
                    <Truck size={16} className="text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Shipped</p>
                    <p className="text-sm text-gray-600">
                      {order.status === 'shipped' ? 'Your order is on the way!' :
                       order.status === 'delivered' ? 'Package was delivered' :
                       `Estimated delivery: ${estimatedDelivery.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivered/Pickup */}
              <div className="relative flex items-start">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  order.status === 'delivered' ? 'bg-green-600' : 'bg-gray-300'
                }`}>
                  {order.shippingMethod === 'pickup' ? (
                    <Home size={16} className="text-white" />
                  ) : (
                    <CheckCircle size={16} className="text-white" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="font-semibold text-gray-900">
                    {order.shippingMethod === 'pickup' ? 'Ready for Pickup' : 'Delivered'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.status === 'delivered'
                      ? 'Order completed'
                      : order.shippingMethod === 'pickup'
                      ? 'We will notify you when ready'
                      : `Expected by ${estimatedDelivery.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Shipping Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin size={20} className="mr-2" />
              {order.shippingMethod === 'pickup' ? 'Pickup Information' : 'Shipping Address'}
            </h2>
            {order.shippingMethod === 'pickup' ? (
              <div>
                <p className="font-semibold text-gray-900 mb-2">Our Farm Location</p>
                <p className="text-gray-600">
                  123 Durian Farm Road<br />
                  Penang, Malaysia<br />
                  Opening Hours: 9:00 AM - 6:00 PM
                </p>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Please bring your order number when picking up.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-gray-900">{order.shippingAddress.recipientName}</p>
                <p className="text-gray-600 mt-2">
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.addressLine2 && (
                    <>{order.shippingAddress.addressLine2}<br /></>
                  )}
                  {order.shippingAddress.postcode} {order.shippingAddress.city}<br />
                  {order.shippingAddress.state}, {order.shippingAddress.country}
                </p>
                <p className="text-gray-600 mt-2">
                  <strong>Phone:</strong> {order.shippingAddress.phone}
                </p>
              </div>
            )}
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Shipping Method:</strong>{' '}
                {order.shippingMethod === 'standard' && 'Standard Delivery (3-5 days)'}
                {order.shippingMethod === 'express' && 'Express Delivery (1-2 days)'}
                {order.shippingMethod === 'pickup' && 'Self Pickup'}
              </p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCard size={20} className="mr-2" />
              Payment Information
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-semibold ${
                  isPaid ? 'text-green-600' :
                  order.paymentStatus === 'failed' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                </span>
              </div>
              {order.transactions && order.transactions.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-gray-900">
                    {order.transactions[0].curlecPaymentId?.slice(0, 16)}...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center space-x-4 pb-4 border-b last:border-0">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.product.images && item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <span className="text-3xl">🥭</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-600">{item.product.variety}</p>
                  <p className="text-sm text-gray-600">
                    RM {item.price.toFixed(2)} × {item.quantity} {item.product.unit}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">RM {item.subtotal.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 pt-6 border-t space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>RM {order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-RM {order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax (6% SST)</span>
              <span>RM {order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? 'FREE' : `RM ${order.shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span className="text-green-600">RM {order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Notes */}
        {order.customerNotes && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Special Instructions</h2>
            <p className="text-gray-700">{order.customerNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/shop"
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors text-center"
          >
            Continue Shopping
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Download size={18} className="mr-2" />
            Print Receipt
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help with your order?{' '}
            <a href="mailto:support@durianshop.com" className="text-green-600 hover:underline">
              Contact our support team
            </a>
          </p>
          <p className="mt-2">
            Order Number: <span className="font-mono font-semibold">{order.orderNumber}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
