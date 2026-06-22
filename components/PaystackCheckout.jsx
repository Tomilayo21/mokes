"use client";

export default function PaystackCheckout({ checkoutData }) {
  const pay = async () => {
    const res = await fetch("/api/paystack/custom", {
      method: "POST",
      body: JSON.stringify(checkoutData),
    });

    const data = await res.json();

    window.location.href = data.authorizationUrl;
  };

  return (
    <div>
      <p className="mb-4">
        You’ll complete payment securely with Paystack.
      </p>

      <button
        onClick={pay}
        className="w-full bg-green-600 text-white py-3 rounded"
      >
        Continue to Paystack
      </button>
    </div>
  );
}