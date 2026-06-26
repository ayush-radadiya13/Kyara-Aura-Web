import { NextResponse } from "next/server";

// Razorpay performs a top-level POST to this URL after a redirect-mode payment.
// The body is form-encoded, so this must run per-request and never be cached.
export const dynamic = "force-dynamic";

function readField(formData, ...keys) {
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === "string" && value) return value;
  }
  return "";
}

async function handle(request) {
  const requestUrl = new URL(request.url);

  // Our own context, passed through the callback_url query string when checkout opened.
  const orderId = requestUrl.searchParams.get("order_id") ?? "";
  const checkoutType = requestUrl.searchParams.get("checkout_type") ?? "cart";

  let razorpayPaymentId = "";
  let razorpayOrderId = "";
  let razorpaySignature = "";
  let errorDescription = "";

  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      razorpayPaymentId = readField(formData, "razorpay_payment_id");
      razorpayOrderId = readField(formData, "razorpay_order_id");
      razorpaySignature = readField(formData, "razorpay_signature");
      errorDescription = readField(
        formData,
        "error[description]",
        "error_description",
        "error[reason]",
      );
    } catch {
      // Missing/unreadable body is handled by the processing page as "unconfirmed".
    }
  } else {
    razorpayPaymentId = requestUrl.searchParams.get("razorpay_payment_id") ?? "";
    razorpayOrderId = requestUrl.searchParams.get("razorpay_order_id") ?? "";
    razorpaySignature = requestUrl.searchParams.get("razorpay_signature") ?? "";
    errorDescription = requestUrl.searchParams.get("error") ?? "";
  }

  const processingUrl = new URL("/payment/processing", requestUrl.origin);
  const fields = {
    order_id: orderId,
    checkout_type: checkoutType,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_order_id: razorpayOrderId,
    razorpay_signature: razorpaySignature,
    error: errorDescription,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value) processingUrl.searchParams.set(key, value);
  }

  // 303 forces the browser to follow up with a GET so the client page can load.
  return NextResponse.redirect(processingUrl, { status: 303 });
}

export const GET = handle;
export const POST = handle;
