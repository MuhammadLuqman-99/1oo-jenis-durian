import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Verify webhook signature (important for security)
    const signature = request.headers.get("curlec-signature");

    // Log the webhook event
    console.log("Curlec Webhook received:", {
      event: payload.type,
      paymentId: payload.data?.id,
      status: payload.data?.status,
      timestamp: new Date().toISOString(),
    });

    // Handle different webhook events
    switch (payload.type) {
      case "payment_intent.succeeded":
        // Payment successful - save order to database
        console.log("Payment succeeded:", payload.data);
        // TODO: Save order to Firebase/database
        // TODO: Send confirmation email
        // TODO: Update inventory
        break;

      case "payment_intent.payment_failed":
        // Payment failed
        console.log("Payment failed:", payload.data);
        // TODO: Log failed payment
        break;

      case "payment_intent.canceled":
        // Payment canceled by user
        console.log("Payment canceled:", payload.data);
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
