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

  const content = {
    processing: {
      title: "Processing your request",
      message: "We’re updating your preferences…",
      color: "text-zinc-600",
    },
    success: {
      title: "You’ve been unsubscribed",
      message:
        "You will no longer receive emails from MOKÉS. You can resubscribe anytime if you change your mind.",
      color: "text-black",
      icon: "✓",
    },
    error: {
      title: "Something went wrong",
      message:
        "We couldn’t complete your request right now. Please try again later.",
      color: "text-red-600",
      icon: "!",
    },
    invalid: {
      title: "Invalid link",
      message:
        "This unsubscribe link is missing required information or has expired.",
      color: "text-yellow-600",
      icon: "⚠",
    },
  };

  const { title, message, color, icon } = content[status];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-sm p-8 text-center">

        {/* ICON */}
        {/* <div className="flex justify-center mb-4">
          <div className="w-14 h-14 flex items-center justify-center rounded-full bg-zinc-100 text-xl font-bold">
            {status === "processing" ? "..." : icon}
          </div>
        </div> */}

        {/* TITLE */}
        <h1 className={`text-xl font-semibold mb-2 ${color}`}>
          {title}
        </h1>

        {/* MESSAGE */}
        <p className="text-sm text-zinc-600 leading-relaxed mb-6">
          {message}
        </p>

        {/* LOADING STATE */}
        {status === "processing" && (
          <div className="flex justify-center mb-6">
            <div className="w-5 h-5 border-2 border-zinc-300 border-t-black rounded-full animate-spin" />
          </div>
        )}

        {/* ACTION */}
        {status !== "processing" && (
          <Link
            href="/"
            className="inline-block w-full px-4 py-3 text-sm bg-black text-white rounded-lg hover:bg-zinc-800 transition"
          >
            Return to MOKÉS
          </Link>
        )}

        {/* FOOTNOTE */}
        <p className="text-xs text-zinc-400 mt-6">
          You can always rejoin our newsletter anytime.
        </p>
      </div>
    </div>
  );
}