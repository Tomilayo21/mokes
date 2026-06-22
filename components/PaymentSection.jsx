"use client";

import React from "react";

export default function PaymentSection({
  paymentMethod,
  setPaymentMethod,
  useShippingAsBilling,
  setUseShippingAsBilling,
  saveInfo,
  setSaveInfo,
  handlePayment,
}) {
  return (
    <div className="mt-10 border-t pt-6 space-y-5">

      <h2 className="text-lg font-medium text-gray-700">
        Payment
      </h2>

      <p className="text-xs text-gray-500">
        All transactions are secure and encrypted.
      </p>

      {/* PAYMENT OPTIONS */}
      <div className="space-y-3">

        {/* STRIPE */}
        <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
          paymentMethod === "stripe"
            ? "border-black bg-gray-50"
            : "border-gray-200"
        }`}>
          
          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === "stripe"}
              onChange={() => setPaymentMethod("stripe")}
            />

            <span className="text-sm font-medium text-gray-700">
              Card (Stripe)
            </span>
          </div>

          {/* LOGOS */}
          <div className="flex items-center gap-2">
            <img src="/cards/visa.png" className="h-5" />
            <img src="/cards/mastercard.png" className="h-5" />
            <img src="/cards/amex.png" className="h-5" />
          </div>
        </label>

        {/* PAYSTACK */}
        <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
          paymentMethod === "paystack"
            ? "border-black bg-gray-50"
            : "border-gray-200"
        }`}>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === "paystack"}
              onChange={() => setPaymentMethod("paystack")}
            />

            <span className="text-sm font-medium text-gray-700">
              Paystack
            </span>
          </div>

          <div className="flex items-center gap-2">
            <img src="/payments/paystack.png" className="h-5" />
          </div>
        </label>

        {/* PAYPAL */}
        <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
          paymentMethod === "paypal"
            ? "border-black bg-gray-50"
            : "border-gray-200"
        }`}>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === "paypal"}
              onChange={() => setPaymentMethod("paypal")}
            />

            <span className="text-sm font-medium text-gray-700">
              PayPal
            </span>
          </div>

          <div className="flex items-center gap-2">
            <img src="/payments/paypal.png" className="h-5" />
          </div>
        </label>

        {/* KLARNA */}
        {/* <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition ${
          paymentMethod === "klarna"
            ? "border-black bg-gray-50"
            : "border-gray-200"
        }`}>

          <div className="flex items-center gap-3">
            <input
              type="radio"
              checked={paymentMethod === "klarna"}
              onChange={() => setPaymentMethod("klarna")}
            />

            <span className="text-sm font-medium">
              Klarna
            </span>
          </div>

          <div className="flex items-center gap-2">
            <img src="/payments/klarna.png" className="h-5" />
          </div>
        </label> */}

      </div>

      {/* OPTIONS */}
      <div className="space-y-3 pt-4 border-t">

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={useShippingAsBilling}
            onChange={() => setUseShippingAsBilling(!useShippingAsBilling)}
          />
          Use shipping as billing
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={saveInfo}
            onChange={() => setSaveInfo(!saveInfo)}
          />
          Save for faster checkout
        </label>

        <p className="text-xs text-gray-400">
          By continuing you agree to Terms & Privacy Policy
        </p>
      </div>

      {/* BUTTON */}
      <button
        onClick={() => handlePayment(paymentMethod)}
        className="w-full bg-black text-white py-3 rounded-lg font-medium mt-4"
      >
        Pay with {paymentMethod.toUpperCase()}
      </button>
    </div>
  );
}