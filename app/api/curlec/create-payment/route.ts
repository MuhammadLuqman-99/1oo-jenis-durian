import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();

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

    // Prepare Curlec payment payload
    const paymentPayload = {
      amount: Math.round(orderData.total * 100), // Convert to cents
      currency: "MYR",
      description: `Durian Order - ${orderData.items.length} items`,
      customer: {
        name: orderData.customer.name,
        email: orderData.customer.email,
        phone: orderData.customer.phone,
      },
      billing_address: {
        line1: orderData.customer.address,
        city: orderData.customer.city,
        state: orderData.customer.state,
        postcode: orderData.customer.postcode,
        country: "MY",
      },
      metadata: {
        order_id: `ORDER-${Date.now()}`,
        items: JSON.stringify(orderData.items),
        timestamp: orderData.timestamp,
      },
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004"}/payment/success`,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3004"}/api/curlec/webhook`,
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

    // Return the payment URL to redirect user
    return NextResponse.json({
      success: true,
      paymentUrl: curlecData.next_action?.redirect_to_url?.url || curlecData.client_secret,
      paymentId: curlecData.id,
    });

  } catch (error: any) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
