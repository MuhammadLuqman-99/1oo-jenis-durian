# Curlec Payment Gateway Setup Guide

## Overview
This durian farm e-commerce system uses **Curlec** as the payment gateway to accept payments from Malaysian customers via FPX (online banking), credit cards, and other local payment methods.

## What is Curlec?
Curlec is a Malaysian payment gateway that provides:
- ✅ FPX (online banking) - all major Malaysian banks
- ✅ Credit/Debit cards (Visa, Mastercard)
- ✅ E-wallets (coming soon)
- ✅ Low transaction fees
- ✅ Fast settlement (T+1 days)
- ✅ Built for Malaysian businesses

## Setup Instructions

### 1. Create Curlec Account

1. Go to [Curlec Website](https://curlec.com/)
2. Click "Sign Up" or "Get Started"
3. Fill in your business details:
   - Business name: "Your Durian Farm Name"
   - Business type: Agriculture / E-commerce
   - Email and phone number
4. Submit required documents:
   - SSM registration (for companies)
   - IC copy (for sole proprietors)
   - Bank account details for settlement
5. Wait for approval (usually 1-3 business days)

### 2. Get API Credentials

Once approved:

1. Login to [Curlec Dashboard](https://dashboard.curlec.com/)
2. Go to **Settings** > **API Keys**
3. You will see:
   - **Test Mode** keys (for development/testing)
   - **Live Mode** keys (for production)
4. Copy your API credentials:
   ```
   API Key: pk_test_xxxxx (or pk_live_xxxxx for production)
   API Secret: sk_test_xxxxx (or sk_live_xxxxx for production)
   ```

### 3. Configure Your App

1. Open your project folder
2. Copy `.env.local.example` to `.env.local`:
   ```bash
   copy .env.local.example .env.local
   ```

3. Open `.env.local` and add your Curlec credentials:
   ```env
   # For Testing (use test keys)
   CURLEC_API_KEY=pk_test_your_key_here
   CURLEC_API_SECRET=sk_test_your_secret_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3004

   # For Production (switch to live keys)
   # CURLEC_API_KEY=pk_live_your_key_here
   # CURLEC_API_SECRET=sk_live_your_secret_here
   # NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

4. Save the file and restart your development server

### 4. Set Up Webhook (Important!)

Webhooks notify your app when payments succeed/fail:

1. In Curlec Dashboard, go to **Settings** > **Webhooks**
2. Click "Add Endpoint"
3. Enter your webhook URL:
   - **Local testing**: `https://your-ngrok-url.ngrok.io/api/curlec/webhook`
   - **Production**: `https://yourdomain.com/api/curlec/webhook`
4. Select events to listen to:
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `payment_intent.canceled`
5. Save the webhook endpoint

**Note**: For local testing, use [ngrok](https://ngrok.com/) to expose your localhost:
```bash
ngrok http 3004
```

## How the Payment Flow Works

### Step 1: Customer Places Order
1. Customer visits `/order` page
2. Selects durian varieties and quantities
3. Fills in delivery information
4. Clicks "Proceed to Payment"

### Step 2: Create Payment Intent
1. Frontend sends order to `/api/curlec/create-payment`
2. Backend creates payment intent with Curlec API
3. Returns payment URL to customer

### Step 3: Customer Pays
1. Customer redirected to Curlec payment page
2. Customer selects FPX and their bank
3. Customer logs into online banking
4. Customer authorizes payment

### Step 4: Payment Confirmation
1. Curlec processes payment
2. Sends webhook to your app with payment status
3. Customer redirected to `/payment/success` page
4. Order saved to database

## Testing the Integration

### Test Mode

Curlec provides test cards and bank accounts for testing:

**Test FPX:**
- Any bank in test mode
- Use any amount
- Payment will always succeed

**Test Credit Cards:**
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVV: Any 3 digits
```

### Testing Steps

1. Go to `http://localhost:3004/order`
2. Add durians to cart (e.g., 2kg Musang King)
3. Fill in customer information
4. Click "Proceed to Payment"
5. You'll be redirected to Curlec payment page
6. Select **FPX** as payment method
7. Choose any test bank
8. Payment will complete successfully
9. You'll be redirected back to success page

## Supported Payment Methods

### FPX (Online Banking)
All major Malaysian banks:
- Maybank
- CIMB Bank
- Public Bank
- RHB Bank
- Hong Leong Bank
- AmBank
- Bank Islam
- OCBC Bank
- Standard Chartered
- UOB Bank
- Bank Rakyat
- HSBC Bank
- Affin Bank
- Alliance Bank
- And more...

### Credit/Debit Cards
- Visa
- Mastercard
- American Express

### Transaction Fees

Curlec charges competitive rates:
- **FPX**: 1.0% + RM 0.50 per transaction
- **Cards**: 2.6% + RM 0.50 per transaction

## Security Features

✅ **PCI DSS Compliant** - Curlec handles all sensitive card data
✅ **3D Secure** - Additional verification for card payments
✅ **Encryption** - All data encrypted in transit
✅ **Fraud Detection** - Built-in fraud prevention
✅ **Webhook Signatures** - Verify webhook authenticity

## Going Live (Production)

### Pre-Launch Checklist

1. **Get Live API Credentials**
   - Switch from test keys to live keys
   - Update `.env.local` with live credentials

2. **Update Webhook URL**
   - Set production webhook URL in Curlec dashboard
   - Test webhook is receiving events

3. **Update Redirect URLs**
   - Set `NEXT_PUBLIC_BASE_URL` to your domain
   - Test success/failure redirects

4. **Enable Production Mode**
   ```env
   CURLEC_API_KEY=pk_live_xxxxx
   CURLEC_API_SECRET=sk_live_xxxxx
   NEXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

5. **Test Live Payments**
   - Make a small real payment (RM 1.00)
   - Verify order is created
   - Verify webhook is triggered
   - Verify funds received in bank account

### Production Best Practices

1. **Monitor Payments**
   - Check Curlec dashboard daily
   - Monitor webhook logs
   - Track successful vs failed payments

2. **Handle Errors Gracefully**
   - Show user-friendly error messages
   - Log errors for debugging
   - Retry failed webhook deliveries

3. **Security**
   - Never expose API secrets in frontend code
   - Verify webhook signatures
   - Use HTTPS for all pages
   - Implement rate limiting

4. **Customer Support**
   - Respond to payment issues quickly
   - Check Curlec dashboard for transaction details
   - Provide refunds if needed

## Troubleshooting

### Error: "Payment gateway not configured"
- Check `.env.local` file exists
- Verify API keys are correct
- Restart dev server

### Webhook not receiving events
- Check webhook URL is correct
- Verify endpoint is publicly accessible
- For local testing, use ngrok
- Check webhook logs in Curlec dashboard

### Payment fails immediately
- Check you're using test keys in test mode
- Verify API credentials are correct
- Check Curlec dashboard for error details

### Redirect not working
- Verify `NEXT_PUBLIC_BASE_URL` is correct
- Check success page URL is accessible
- Look for errors in browser console

## Additional Features (Future)

- ✅ Installment payments (BNPL)
- ✅ Recurring subscriptions
- ✅ Refund management
- ✅ Multi-currency support
- ✅ Advanced reporting
- ✅ Loyalty points integration

## Support

### Curlec Support
- Email: support@curlec.com
- Phone: +603-2935 0168
- Dashboard: https://dashboard.curlec.com/
- Documentation: https://docs.curlec.com/

### Our Support
- For app-related issues, check the code documentation
- Payment-specific issues should be raised with Curlec

## Summary

✅ Curlec account created and approved
✅ API credentials configured in `.env.local`
✅ Webhook endpoint set up
✅ Payment flow tested in test mode
✅ Ready to accept payments!

Happy selling durians! 🌿💰
