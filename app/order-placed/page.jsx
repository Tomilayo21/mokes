//app\order-placed\page.jsx
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
  const [progress, setProgress] = useState(0);
  const [countdown, setCountdown] = useState(5);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorState, setErrorState] = useState(null);

  useEffect(() => {
    if (status === "loading") return;

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
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 ${
              t.visible
                ? "animate-toast-bounce opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <p className={`flex-1 text-sm font-medium ${color}`}>{message}</p>

            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-black"
            >
              ✕
            </button>
          </div>
        ),
        { duration: 5000, position: "top-right" }
      );
    };

    const finalizeOrder = async () => {
      const pending = sessionStorage.getItem("pendingOrder");

      if (!pending) {
        showToast("Order details not found.");
        setFinalizing(false);
        return;
      }

      if (status !== "authenticated") {
        showToast("Please sign in.");
        setFinalizing(false);
        return;
      }

      try {
        const orderData = JSON.parse(pending);

        console.log("Pending order:", orderData);

        const endpoint =
          orderData.paymentMethod?.toLowerCase() === "stripe"
            ? "/api/order/stripe/create"
            : "/api/order/paystack/create";

        const res = await axios.post(
          endpoint,
          {
            address: orderData.address || orderData.addressId,
             items: orderData.items || [],
            reference: orderData.reference || null,
          },
          {
            withCredentials: true,
          }
        );

        if (!res.data.success) {
          throw new Error(res.data.message);
        }

        setProgress(100);
        setFinalizing(false);
        setSuccessMessage("Order placed successfully");

        setCartItems({});
        sessionStorage.removeItem("pendingOrder");

        let counter = 5;

        const timer = setInterval(() => {
          counter--;

          setCountdown(counter);

          if (counter <= 0) {
            clearInterval(timer);
            router.push("/my-orders");
          }
        }, 1000);
      } catch (error) {
        console.error("Finalize Order Error:", error);

        const message =
          error.response?.data?.message ||
          error.message ||
          "Order creation failed";

        setErrorState(message);
        showToast(message);
      } finally {
        setFinalizing(false);
      }
    };

    finalizeOrder();
  }, [status]);

  useEffect(() => {
    if (!finalizing) return;

    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return prev; // pause near finish
        return prev + Math.random() * 6;
      });
    }, 180);

    return () => clearInterval(interval);
  }, [finalizing]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-100 px-4 py-10">

      <div className="w-full max-w-md bg-white border border-gray-100 shadow-xl rounded-sm p-8 text-center relative overflow-hidden">

        {/* Soft background glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top,theme(colors.orange.400),transparent_60%)] pointer-events-none" />

        {/* Loader / Success Icon */}
        <div className="flex justify-center mb-6 relative z-10">
          {!finalizing && !errorState && (
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-green-50 animate-[pop_0.35s_ease-out]">
              <CheckCircle className="h-14 w-14 text-green-500" />
            </div>
          )}

          {!finalizing && errorState && (
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-red-50">
              <XCircle className="h-14 w-14 text-red-500" />
            </div>
          )}
        </div>

        {!finalizing && !errorState && (
          <div className="inline-flex mb-4 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold tracking-wide uppercase">
            Payment Verified
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-medium text-gray-900 relative z-10">
          {finalizing
            ? "Finalizing your order"
            : errorState
            ? "Order Failed"
            : "Order Confirmed"}
        </h1>

        {/* Subtext */}
        <p className="mt-3 text-sm md:text-base text-gray-500 leading-relaxed relative z-10">
          {finalizing &&
            "Please wait while we verify payment and complete your purchase."}

          {!finalizing && !errorState && (
            <>
              {/* {successMessage} */}
              <br />
              <span className="text-green-600 font-medium">
                Redirecting to your orders in {countdown}s...
              </span>
            </>
          )}

          {!finalizing && errorState && errorState}
        </p>

        {/* Progress hint while loading */}
        {finalizing && (
          <div className="mt-8 relative z-10">
            <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex justify-between mt-3">
              <p className="text-sm text-gray-500">
                Securing payment...
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {Math.floor(progress)}%
              </p>
            </div>
          </div>
        )}


        {/* Footer hint */}
        {!finalizing && (
          <p className="text-xs text-gray-400 mt-6 relative z-10">
            A confirmation email has been sent to your inbox.
          </p>
        )}

      </div>
    </div>
  );
};

export default OrderPlaced;
