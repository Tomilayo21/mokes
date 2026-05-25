"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UnsubscribePage() {
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get("email");

    if (!email) {
      setStatus("invalid");
      return;
    }

    const unsubscribe = async () => {
      try {
        const res = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await res.json();
        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    unsubscribe();
  }, []);

  const renderContent = () => {
    if (status === "processing") {
      return <p>Processing your request...</p>;
    }

    const statusContent = {
      success: {
        title: "Unsubscribed",
        message: "You have been successfully removed from our subscribers list.",
        color: "text-green-600",
      },
      error: {
        title: "Error",
        message: "Something went wrong. Please try again later.",
        color: "text-red-600",
      },
      invalid: {
        title: "Invalid Request",
        message: "No valid email found in the link.",
        color: "text-yellow-600",
      },
    };

    const { title, message, color } = statusContent[status] || {};

    return (
      <div className="text-center">
        <h1 className={`text-2xl font-bold mb-2 ${color}`}>{title}</h1>
        <p className="mb-4">{message}</p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Go back to homepage
        </Link>
      </div>
    );
  };

  return <div className="min-h-screen flex items-center justify-center p-4">{renderContent()}</div>;
}
