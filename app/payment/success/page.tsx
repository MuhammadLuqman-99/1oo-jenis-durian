"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Home, Mail } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Get payment details from URL params
    const paymentId = searchParams.get("payment_intent");
    const status = searchParams.get("status");

    if (status === "succeeded" || status === "success") {
      setOrderDetails({
        paymentId,
        status,
        timestamp: new Date().toISOString(),
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-6">
              <CheckCircle size={80} className="text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            Thank you for your order. Your fresh durians are on the way!
          </p>

          {/* Order Details */}
          {orderDetails && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-gray-900">{orderDetails.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-green-600 uppercase">{orderDetails.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="text-gray-900">
                    {new Date(orderDetails.timestamp).toLocaleString("en-MY")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <Package size={20} className="text-blue-600" />
              <span>What happens next?</span>
            </h3>

            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>You will receive an email confirmation shortly</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Our team will prepare your fresh durians</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Delivery will be arranged within 1-2 business days</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 font-bold mt-0.5">✓</span>
                <span>Track your order via email updates</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-sm text-gray-700 flex items-start space-x-2">
              <Mail size={16} className="text-yellow-600 mt-0.5" />
              <span>
                Need help? Contact us at <strong>support@durianfarm.com</strong> or call <strong>012-345 6789</strong>
              </span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-tropical-green to-tropical-lime hover:from-tropical-lime hover:to-tropical-green text-white font-bold px-8 py-4 rounded-lg transition-all shadow-lg"
            >
              <Home size={20} />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/order"
              className="flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 text-tropical-green font-bold px-8 py-4 rounded-lg transition-all shadow-lg border-2 border-tropical-green"
            >
              <Package size={20} />
              <span>Order Again</span>
            </Link>
          </div>

          {/* Thank You Message */}
          <p className="text-gray-500 mt-8 text-sm">
            Thank you for supporting our local durian farm! 🌿
          </p>
        </div>
      </div>
    </div>
  );
}
