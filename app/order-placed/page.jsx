'use client';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, PartyPopper,  XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const OrderPlaced = () => {
  const { setCartItems } = useAppContext();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [finalizing, setFinalizing] = useState(true);

  useEffect(() => {
    const finalizeOrder = async () => {
      const pending = sessionStorage.getItem("pendingOrder");

      const showToast = (message, type = "error") => {
        const color =
          type === "success"
            ? "text-green-800"
            : type === "info"
            ? "text-gray-800"
            : "text-red-800";

        toast.custom(
          (t) => (
            <div
              className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
                t.visible
                  ? "animate-toast-bounce opacity-100"
                  : "translate-x-10 opacity-0"
              }`}
            >
              <p className={`flex-1 text-sm font-medium ${color}`}>
                {message}
              </p>

              {/* Close */}
              <button
                onClick={() => toast.dismiss(t.id)}
                className="text-gray-400 cursor-pointer hover:text-black transition"
              >
                ✕
              </button>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
                <div
                  className="h-full bg-[var(--sage)]"
                  style={{
                    animation: `toast-progress ${t.duration}ms linear forwards`,
                  }}
                />
              </div>
            </div>
          ),
          {
            duration: 4000,
            position: "top-right",
          }
        );
      };

      // ❌ NO ORDER FOUND
      if (!pending) {
        showToast("We couldn’t locate your order details. Please try again.");
        setFinalizing(false);
        return;
      }

      // ❌ NOT AUTHENTICATED
      if (status !== "authenticated") {
        showToast("Please sign in to complete your order.", "error");
        setFinalizing(false);
        return;
      }

      try {
        const orderData = JSON.parse(pending);

        const endpoint =
          orderData.paymentMethod.toLowerCase() === "stripe"
            ? "/api/order/stripe/create"
            : "/api/order/paystack/create";

        const res = await axios.post(
          endpoint,
          {
            address: orderData.address,
            items: orderData.items,
          },
          {
            withCredentials: true, // 🔥 THIS IS REQUIRED
          }
        );

        // ❌ FAILED RESPONSE
        if (!res.data.success) {
          showToast(
            res.data.message || "Something went wrong. Please try again."
          );
          return;
        }

        // ✅ SUCCESS
        showToast("Your order has been placed successfully. Redirecting…", "success");

        setCartItems({});
        sessionStorage.removeItem("pendingOrder");

        setTimeout(() => router.push("/my-orders"), 1500);
      } catch (error) {
        console.error("Finalize Order Error:", error);

        showToast("Please check your connection and try again.");
      } finally {
        setFinalizing(false);
      }
    };

    if (status === "authenticated") {
      finalizeOrder();
    }
  }, [session, status, setCartItems, router]);


  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-10 bg-gradient-to-b from-white via-gray-50 to-gray-100">
      
      {/* Loader / Success Icon */}
      <div className="relative flex justify-center items-center mb-6">
        {finalizing ? (
          <div className="animate-spin rounded-full h-28 w-28 border-4 border-t-orange-500 border-gray-200 dark:border-neutral-700"></div>
        ) : (
          <CheckCircle className="h-28 w-28 text-[var(--sage)]" />
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center">
        {finalizing ? "Processing your order" : "Order Confirmed"}
      </h1>

      {/* Subtext */}
      <p className="mt-3 text-sm md:text-base text-gray-500 text-center max-w-md">
        {finalizing
          ? "Please wait while we securely finalize your transaction. This may take a few moments."
          : "Thank you for your purchase. Your order has been successfully placed and is now being prepared for delivery."}
      </p>

      {/* Actions */}
      {!finalizing && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <a
            href="/my-orders"
            className="w-full sm:w-auto px-6 py-3 rounded-sm bg-[var(--sage)] hover:bg-zinc-500 text-white font-medium shadow-md transition text-center"
          >
            View Orders
          </a>
          <a
            href="/collections/all"
            className="w-full sm:w-auto px-6 py-3 rounded-sm border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium shadow-sm transition text-center"
          >
            Continue Shopping
          </a>
        </div>
      )}

    </div> 
  );
};

export default OrderPlaced;
