"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loading from "@/components/Loading";
import { Package, Printer, MapPin, Phone, User } from "lucide-react";

export default function ReceiptPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await axios.get(`/api/orders/${orderId}`);
        if (data.success) setOrder(data.order);
      } catch (err) {
        console.error(err);
      }
    };

    if (orderId) fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (order) {
      document.title = `Invoice-${order.orderId || order._id}`;
    }

    return () => {
      document.title = "Mokes";
    };
  }, [order]);

  if (!order) return <Loading />;

  const itemsTotal = order.items?.reduce(
    (sum, item) => sum + item.quantity * (item.price || 0),
    0
  );

  const productHeader = order.items.length > 1 ? "Products" : "Product";
  const address = order.address || order.shippingAddress || order.deliveryAddress || {};

  return (
    <div className="bg-gray-100 min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">

        {/* HEADER */}
        <div className="bg-orange-600 text-white p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-sm opacity-90">
              Order #{order.orderId || order._id}
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100"
          >
            <Printer size={16} />
            Print
          </button>
        </div>

        {/* CUSTOMER INFO */}
        <div className="p-6 border-b grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h2 className="font-semibold text-gray-700 mb-2">Billed To</h2>

            <div className="space-y-1 text-gray-600">
              <p className="flex items-center gap-2 uppercase">
                <User size={14} />
                {address.fullName || "No name provided"}
              </p>

              <p className="flex items-center gap-2">
                <Phone size={14} />
                {address.phoneNumber || "No phone provided"}
              </p>

              <p className="flex items-center gap-2">
                <MapPin size={14} />
                {address.city || "No city"},{" "}
                {address.state || "No state"}
              </p>
            </div>
          </div>

          <div className="text-right">
            <h2 className="font-semibold text-gray-700 mb-2">Order Info</h2>
            <p className="text-gray-600">
              Date:{" "}
              {new Date(order.createdAt).toLocaleDateString("en-NG", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-600">
              Status:{" "}
              <span className="font-medium">{order.orderStatus}</span>
            </p>
            <p className="text-gray-600">
              Payment: {order.paymentStatus || "Pending"}
            </p>
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="p-6">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Package size={16} /> Order Items
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2">{productHeader}</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {order.items?.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-3 font-medium text-gray-800 max-w-[200px]">
                      <span className="line-clamp-2">
                        {item.product?.brand?.toUpperCase()} | {item.product?.name} | {item.product?.color}
                        {item.size && ` | Size ${item.size}`}
                      </span>
                    </td>
                    <td className="text-black">{item.quantity}</td>
                    <td className="text-black">
                      ₦{item.price?.toLocaleString()}
                    </td>
                    <td className="text-right text-black">
                      ₦{(item.quantity * item.price).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* TOTALS */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-1/2 space-y-2 text-sm">

              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-600">₦{itemsTotal?.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-600">₦0</span>
              </div>

              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span className="text-gray-600">Total</span>
                <span className="text-orange-600">
                  ₦{order.amount?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 text-center p-4 text-xs text-gray-500">
          Thank you for your purchase. If you have any questions, contact support.
        </div>
      </div>

      {/* PRINT STYLES */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}