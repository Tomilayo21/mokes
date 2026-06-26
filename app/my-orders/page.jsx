'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import relativeTime from "dayjs/plugin/relativeTime";
import { Package, Truck, CreditCard, DollarSign, MapPin, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import dayjs from "@/lib/dayjs";
import OrderItemsPreview from "@/components/OrderItemsPreview"; 


dayjs.extend(relativeTime);

const MyOrders = () => {
  const { currency } = useAppContext();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 8;
  const router = useRouter();
  const [activeOrder, setActiveOrder] = useState(null);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const paymentMethods = [
    { id: "stripe", label: "Stripe", fee: 0.029 },
    { id: "paystack", label: "Paystack", fee: 0.015 },
    { id: "paypal", label: "PayPal", fee: 0.034 },
    { id: "apple", label: "Apple Pay", fee: 0.025 },
    { id: "google", label: "Google Pay", fee: 0.025 },
    { id: "amazon", label: "Amazon Pay", fee: 0.03 },
    { id: "bank-transfer", label: "Direct Bank Transfer", fee: 0.015 },
    { id: "crypto", label: "Cryptocurrency", fee: 0.02 },
    { id: "mpesa", label: "M-Pesa", fee: 0.025 },
    { id: "paytm", label: "Paytm", fee: 0.02 },
    { id: "cash-on-delivery", label: "Cash on Delivery", fee: 0 },
  ];

  // Fetch orders for the current user
  useEffect(() => {
    if (!userId) return; // don't fetch until we have a user

    const fetchOrders = async () => {
      try {
        const { data } = await axios.get("/api/order/list", {
          headers: { Authorization: `Bearer ${userId}` },
        });

        if (data.success) {
          setOrders(data.orders.reverse());
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        toast.error(err.message || "Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);


  const handleCancelOrder = async (orderId) => {
    if (!userId) {
      toast.error("You must be logged in to cancel an order.");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/order/cancel",
        { orderId },
        { headers: { Authorization: `Bearer ${userId}` } }
      );

      if (data.success) {
        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <Package className="text-orange-500" size={20} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Order cancelled
              </p>
            </div>
          ),
          { duration: 2000, position: "top-right" }
        );

        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId ? { ...o, orderStatus: "Cancelled" } : o
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message || "Failed to cancel order.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!userId) {
      toast.error("You must be logged in to delete an order.");
      return;
    }

    try {
      const { data } = await axios.post(
        "/api/order/delete",
        { orderId },
        { headers: { Authorization: `Bearer ${userId}` } }
      );

      if (data.success) {
        toast.custom(
          (t) => (
            <div
              className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 ${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              }`}
            >
              <Trash2 className="text-red-500" size={20} />
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Order deleted
              </p>
            </div>
          ),
          { duration: 2000, position: "top-right" }
        );

        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete order.");
    }
  };

  const handleDownloadReceipt = (order) => {
    router.push(`/receipt/${order._id}`);
  };



  if (status === "loading" || loading) return <Loading type="orders" />;
  if (status === "unauthenticated") return <p>Please log in to view your orders.</p>;

  const totalPages = Math.ceil(orders.length / perPage);

  return (
    <div className="items-center pt-8 bg-white text-black min-h-screen">
      <Navbar />
        <main className="px-6 md:px-16 lg:px-32 py-10 min-h-screen">

          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900">
              Order History
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage your recent orders
            </p>
          </div>

          {/* EMPTY STATE */}
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-dashed border-gray-300 rounded-sm">
              <Package className="w-14 h-14 text-gray-400 mb-4" />

              <h3 className="text-lg font-medium text-gray-800">
                No orders found
              </h3>

              <p className="text-sm text-gray-500 mt-1 max-w-md">
                You haven’t placed any orders yet. Once you make a purchase, your order history will appear here.
              </p>

              <button
                onClick={() => router.push("/all-products")}
                className="mt-6 px-6 py-3 bg-[var(--sage)] hover:bg-zinc-500 text-white rounded-xl font-medium shadow-sm transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (

            <div className="space-y-6">

              {orders.slice((page - 1) * perPage, page * perPage).map((order, index) => {

                const method = paymentMethods.find(m => m.id === order.paymentMethod);

                const getStatusBadge = (status) => {
                  const base = "px-2.5 py-1 text-xs rounded-full font-medium";

                  switch (status?.toLowerCase()) {
                    case "delivered":
                      return `${base} bg-green-100 text-green-700`;
                    case "processing":
                      return `${base} bg-yellow-100 text-yellow-700`;
                    case "shipped":
                      return `${base} bg-blue-100 text-blue-700`;
                    case "cancelled":
                      return `${base} bg-red-100 text-red-700`;
                    default:
                      return `${base} bg-gray-100 text-gray-700`;
                  }
                };

                return (
                  <div
                    key={order._id || index}
                    className="bg-white border border-gray-200 rounded-sm shadow-sm hover:shadow-md transition overflow-hidden"
                  >
                    {/* HEADER */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b">
                      
                      {/* LEFT: ORDER ID + META */}
                      <div>
                        <p className="text-xs text-gray-500">
                          Order ID: <span className="font-medium text-gray-700">{order.orderId || order._id}</span>
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          {order.items.length} item{order.items.length > 1 ? "s" : ""} • {method?.label}
                        </p>
                      </div>

                      {/* RIGHT: STATUS + PRICE */}
                      <div className="flex items-center gap-3">
                        <span className={getStatusBadge(order.orderStatus)}>
                          {order.orderStatus}
                        </span>

                        <p className="text-lg font-semibold text-orange-600">
                          {currency}
                          {order.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* PRODUCT PREVIEW STRIP (IMPORTANT PART) */}
                    <div className="p-5">
                      <div className="flex items-center gap-3 overflow-x-auto pb-2">

                        {order.items.slice(0, 4).map((item, i) => (
                          <div key={i} className="relative flex-shrink-0">
                            <Image
                              src={item.product?.image?.[0]}
                              alt={item.product?.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-lg border object-cover bg-white"
                            />

                            {/* quantity badge */}
                            <span className="absolute -bottom-1 -right-1 bg-black text-white text-[10px] px-1.5 py-0.5 rounded-full">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}

                        {/* + MORE INDICATOR */}
                        {order.items.length > 4 && (
                          <div className="w-16 h-16 flex items-center justify-center rounded-lg border bg-gray-50 text-xs text-gray-600 font-medium">
                            +{order.items.length - 4}
                          </div>
                        )}
                      </div>

                      {/* OPTIONAL: QUICK SUMMARY */}
                        <OrderItemsPreview items={order.items} />
                    </div>

                    {/* DETAILS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 pb-5 text-sm">

                      {/* Shipping */}
                      <div>
                        <p className="font-semibold text-gray-800 mb-2">Shipping</p>
                        <div className="text-gray-600 space-y-1">
                          <p>{order.address?.fullName}</p>
                          <p>{order.address?.city}, {order.address?.state}</p>
                          <p>{order.address?.country}</p>
                          <p>{order.address?.phoneNumber}</p>
                        </div>
                      </div>

                      {/* Order Info */}
                      <div>
                        <p className="font-semibold text-gray-800 mb-2">Order Info</p>
                        <div className="text-gray-600 space-y-1">
                          <p>
                            Date:{" "}
                            <span className="font-medium">
                              {dayjs(order.createdAt).tz(tz).format("DD MMM YYYY, hh:mm A")}
                            </span>
                          </p>

                          <p>
                            Payment Status:{" "}
                            <span className="font-medium">
                              {order.paymentStatus || "Pending"}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Delivery */}
                      <div>
                        <p className="font-semibold text-gray-800 mb-2">Delivery</p>

                        {order.trackingNumber ? (
                          <div className="text-gray-600 space-y-1">
                            <p>Tracking: {order.trackingNumber}</p>
                            <p>Carrier: {order.shippingCarrier}</p>
                          </div>
                        ) : (
                          <p className="text-gray-400 text-sm">Not shipped yet</p>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-3 px-5 pb-5 pt-3 border-t bg-gray-50">

                      {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                          Request Cancellation
                        </button>
                      )}

                      {order.orderStatus === "Cancelled" && (
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-900 text-white rounded-lg"
                        >
                          Remove Order
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadReceipt(order)}
                        className="px-4 py-2 text-sm bg-white border hover:bg-gray-100 text-gray-900 rounded-lg"
                      >
                        Download Invoice
                      </button>
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center items-center gap-2">

              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-4 py-2 bg-white dark:bg-neutral-800 border rounded-lg text-sm disabled:opacity-40"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    page === i + 1
                      ? "bg-orange-600 text-white"
                      : "bg-white dark:bg-neutral-800 border hover:bg-gray-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-4 py-2 bg-white dark:bg-neutral-800 border rounded-lg text-sm disabled:opacity-40"
              >
                Next
              </button>

            </div>
          )}

        </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
