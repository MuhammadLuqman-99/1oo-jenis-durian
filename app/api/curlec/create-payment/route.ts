import { NextRequest, NextResponse } from "next/server";
import { createPaymentTransaction } from "@/lib/orderService";

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderData } = await request.json();

    // Curlec API credentials (get from Curlec dashboard)
    const CURLEC_API_KEY = process.env.CURLEC_API_KEY || "";
    const CURLEC_API_SECRET = process.env.CURLEC_API_SECRET || "";

    if (!CURLEC_API_KEY || !CURLEC_API_SECRET) {
      console.error("Curlec credentials not configured");
      return NextResponse.json(
        { success: false, error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    // Create payment transaction record
    const transactionId = await createPaymentTransaction(
      orderId,
      orderData.customerId || 'guest',
      orderData.total,
      'curlec'
    );

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "Failed to create payment transaction" },
        { status: 500 }
      );
    }

    // Prepare Curlec payment payload
    const paymentPayload = {
      amount: Math.round(orderData.total * 100), // Convert to cents
      currency: "MYR",
      description: `${orderData.orderNumber} - ${orderData.items.length} items`,
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
      },
      billing_address: {
        line1: orderData.shippingAddress.addressLine1,
        line2: orderData.shippingAddress.addressLine2 || "",
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        postcode: orderData.shippingAddress.postcode,
        country: orderData.shippingAddress.country || "MY",
      },
      metadata: {
        order_id: orderId,
        order_number: orderData.orderNumber,
        transaction_id: transactionId,
        customer_id: orderData.customerId || 'guest',
        items_count: orderData.items.length,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}/shop/order/${orderId}/success`,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3002"}/api/curlec/webhook`,
    };

    // Create Basic Auth header
    const authString = Buffer.from(`${CURLEC_API_KEY}:${CURLEC_API_SECRET}`).toString("base64");

    // Call Curlec API to create payment
    const curlecResponse = await fetch("https://api.curlec.com/v1/payment_intents", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentPayload),
    });

    const curlecData = await curlecResponse.json();

    if (!curlecResponse.ok) {
      console.error("Curlec API error:", curlecData);
      return NextResponse.json(
        { success: false, error: curlecData.error?.message || "Payment creation failed" },
        { status: 400 }
      );
    }

    // Update payment transaction with Curlec data
    await import('@/lib/orderService').then(m =>
      m.updatePaymentTransaction(transactionId, {
        curlecPaymentId: curlecData.id,
        curlecBillUrl: curlecData.next_action?.redirect_to_url?.url,
        status: 'processing',
        responseData: curlecData,
      })
    );

    // Return the payment URL to redirect user
    return NextResponse.json({
      success: true,
      paymentUrl: curlecData.next_action?.redirect_to_url?.url || curlecData.client_secret,
      paymentId: curlecData.id,
      transactionId,
    });

  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
