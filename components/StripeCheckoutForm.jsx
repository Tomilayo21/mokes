"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";

export default function StripeCheckoutForm({ checkoutData }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const payNow = async () => {
    setLoading(true);

    const res = await fetch("/api/stripe/custom", {
      method: "POST",
      body: JSON.stringify({
        total: checkoutData.total,
      }),
    });

    const data = await res.json();

    await stripe.confirmCardPayment(data.clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    setLoading(false);
  };

  return (
    <>
      <div className="border rounded p-4">
        <CardElement />
      </div>

      <button
        onClick={payNow}
        className="w-full mt-4 bg-black text-white py-3 rounded"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </>
  );
}