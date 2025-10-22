import { NextRequest, NextResponse } from "next/server";
import { confirmOrder, updateOrderStatus, updatePaymentTransaction } from "@/lib/orderService";
import { logActivity } from "@/lib/activityLog";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify webhook signature (important for security)
    const signature = request.headers.get("curlec-signature");
    // TODO: Verify signature with Curlec secret key in production

    // Log the webhook event
    console.log("Curlec Webhook received:", {
      event: payload.type,
      paymentId: payload.data?.id,
      status: payload.data?.status,
      timestamp: new Date().toISOString(),
    });

    const orderId = payload.data?.metadata?.order_id;
    const orderNumber = payload.data?.metadata?.order_number;
    const transactionId = payload.data?.metadata?.transaction_id;
    const paymentId = payload.data?.id;

    // Handle different webhook events
    switch (payload.type) {
      case "payment_intent.succeeded":
        // Payment successful
        console.log("Payment succeeded:", payload.data);

        if (orderId && transactionId) {
          // Update payment transaction status
          await updatePaymentTransaction(transactionId, {
            status: 'success',
            curlecPaymentId: paymentId,
            responseData: payload.data,
            completedAt: new Date().toISOString(),
          });

          // Confirm order (updates status, reduces stock)
          await confirmOrder(orderId, paymentId);

          // Log activity
          logActivity(
            'System',
            'update',
            'User Action',
            `Payment successful for order ${orderNumber}`,
            {
              severity: 'success',
              entityType: 'system',
              entityId: orderId,
              metadata: {
                paymentId,
                amount: payload.data?.amount / 100, // Convert from cents
              },
            }
          );

          // TODO: Send confirmation email to customer
        }
        break;

      case "payment_intent.payment_failed":
        // Payment failed
        console.log("Payment failed:", payload.data);

        if (orderId && transactionId) {
          // Update payment transaction
          await updatePaymentTransaction(transactionId, {
            status: 'failed',
            errorMessage: payload.data?.last_payment_error?.message || 'Payment failed',
            responseData: payload.data,
          });

          // Update order status
          await updateOrderStatus(
            orderId,
            'cancelled',
            `Payment failed: ${payload.data?.last_payment_error?.message || 'Unknown error'}`,
            'System'
          );

          // Log activity
          logActivity(
            'System',
            'update',
            'User Action',
            `Payment failed for order ${orderNumber}`,
            {
              severity: 'error',
              entityType: 'system',
              entityId: orderId,
              metadata: {
                error: payload.data?.last_payment_error?.message,
              },
            }
          );

          // TODO: Send payment failure email
        }
        break;

      case "payment_intent.canceled":
        // Payment canceled by user
        console.log("Payment canceled:", payload.data);

        if (orderId && transactionId) {
          // Update payment transaction
          await updatePaymentTransaction(transactionId, {
            status: 'failed',
            errorMessage: 'Payment cancelled by user',
            responseData: payload.data,
          });

          // Update order status
          await updateOrderStatus(
            orderId,
            'cancelled',
            'Payment cancelled by customer',
            'System'
          );

          // Log activity
          logActivity(
            'System',
            'update',
            'User Action',
            `Payment cancelled for order ${orderNumber}`,
            {
              severity: 'warning',
              entityType: 'system',
              entityId: orderId,
            }
          );
        }
        break;

      default:
        console.log("Unhandled webhook event:", payload.type);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
