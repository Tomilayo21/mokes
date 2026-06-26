"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";

export default function ReceiptPage() {
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("receiptOrder");

    if (stored) {
      setOrder(JSON.parse(stored));
    }
  }, []);

  if (!order) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen">
      <div className="no-print mb-6">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-orange-600 text-white rounded"
        >
          Download / Print Receipt
        </button>
      </div>

      <h1 className="text-3xl font-bold mb-4">Receipt</h1>

      <p><strong>Order ID:</strong> {order.orderId || order._id}</p>
      <p><strong>Customer:</strong> {order.address?.fullName}</p>
      <p><strong>Phone:</strong> {order.address?.phoneNumber}</p>
      <p><strong>Total:</strong> ₦{order.amount?.toLocaleString()}</p>

      <div className="mt-8">
        {order.items.map((item, i) => (
          <div key={i}>
            <p>{item.product.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}