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
      const pending = sessionStorage.getItem('pendingOrder');
      if (!pending) {
        toast.custom(
          (t) => (
            <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-start gap-3 p-4`}>
              <XCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Order not found
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  We couldn’t locate your order details. Please try again.
                </p>
              </div>
            </div>
          ),
          { duration: 3000, position: "top-right" }
        );
        setFinalizing(false);
        return;
      }

      if (status !== "authenticated") {
        toast.custom(
          (t) => (
            <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-start gap-3 p-4`}>
              <XCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Sign in required
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please sign in to complete your order.
                </p>
              </div>
            </div>
          ),
          { duration: 3000, position: "top-right" }
        );
        setFinalizing(false);
        return;
      }

      try {
        const orderData = JSON.parse(pending);
        const endpoint =
          orderData.paymentMethod.toLowerCase() === 'stripe'
            ? '/api/order/stripe/create'
            : '/api/order/paystack/create';

        const res = await axios.post(
          endpoint,
          {
            address: orderData.addressId,
            items: orderData.items,
            userId: session.user.id, // use session user ID
          },
          { headers: { Authorization: `Bearer ${session.user.id}` } }
        );

        if (res.data.success) {
          toast.custom(
            (t) => (
              <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-start gap-3 p-4`}>
                <CheckCircle className="text-green-500 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Order confirmed
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your order has been placed successfully. Redirecting…
                  </p>
                </div>
              </div>
            ),
            { duration: 2500, position: "top-right" }
          );
          setCartItems({}); // clear cart
          sessionStorage.removeItem('pendingOrder');
          setTimeout(() => router.push('/my-orders'), 1500);
        } else {
          toast.custom(
            (t) => (
              <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-start gap-3 p-4`}>
                <XCircle className="text-red-500 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Unable to complete order
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {res.data.message || "Something went wrong. Please try again."}
                  </p>
                </div>
              </div>
            ),
            { duration: 3500, position: "top-right" }
          );
        }
      } catch (error) {
        console.error('Finalize Order Error:', error);
        toast.custom(
          (t) => (
            <div className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-start gap-3 p-4`}>
              <XCircle className="text-red-500 mt-0.5" size={20} />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Order processing failed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Please check your connection and try again.
                </p>
              </div>
            </div>
          ),
          { duration: 3500, position: "top-right" }
        );
      } finally {
        setFinalizing(false);
      }
    };

    if (status === 'authenticated') {
      finalizeOrder();
    }
  }, [session, status, setCartItems, router]);


  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-6 py-10 bg-gradient-to-b from-white via-gray-50 to-gray-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      
      {/* Loader / Success Icon */}
      <div className="relative flex justify-center items-center mb-6">
        {finalizing ? (
          <div className="animate-spin rounded-full h-28 w-28 border-4 border-t-orange-500 border-gray-200 dark:border-neutral-700"></div>
        ) : (
          <CheckCircle className="h-28 w-28 text-green-500" />
        )}
      </div>

      {/* Title */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100 text-center">
        {finalizing ? "Processing your order" : "Order Confirmed"}
      </h1>

      {/* Subtext */}
      <p className="mt-3 text-sm md:text-base text-gray-500 dark:text-gray-400 text-center max-w-md">
        {finalizing
          ? "Please wait while we securely finalize your transaction. This may take a few moments."
          : "Thank you for your purchase. Your order has been successfully placed and is now being prepared for delivery."}
      </p>

      {/* Actions */}
      {!finalizing && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <a
            href="/my-orders"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-md transition text-center"
          >
            View Orders
          </a>
          <a
            href="/all-products"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border border-gray-300 dark:border-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 font-medium shadow-sm transition text-center"
          >
            Continue Shopping
          </a>
        </div>
      )}

    </div> 
  );
};

export default OrderPlaced;
