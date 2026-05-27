"use client";

import { useState } from "react";

export default function NewsLetter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubscribe = async () => {
    setLoading(true);
    setMessage("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await res.json();

      if (res.ok) {
        if (data.alreadySubscribed) {
          setMessage("You're already subscribed to our newsletter.");
        } else {
          setMessage("Subscribed successfully! Check your email for confirmation.");
          setEmail("");
        }
      } else {
        setMessage(data.error || "Subscription failed.");
      }

      // auto-clear message after 5 seconds
      setTimeout(() => setMessage(""), 5000);

    } catch (err) {
      if (err.name === "AbortError") {
        setMessage("Request timed out. Please try again.");
      } else {
        setMessage("Something went wrong.");
      }

      // auto-clear error message too
      setTimeout(() => setMessage(""), 5000);
    }

    setLoading(false);
  };


  return (
    <div>
      <h3 className="text-sm uppercase tracking-[0.2em] mb-5">
        Newsletter
      </h3>

      <p className="text-sm text-zinc-600 mb-4">
        Subscribe for updates, releases, and exclusive offers.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubscribe();
        }}
        className="flex flex-col md:flex-row items-center gap-3 md:gap-0 max-w-2xl w-full z-10"
      >
        <div className="flex flex-col border border-zinc-300 overflow-hidden">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-sm outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full px-5 py-3 text-sm border-t border-zinc-300 
              cursor-pointer bg-[var(--sage)] text-white 
              hover:bg-zinc-500 transition uppercase
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? "Subscribing..." : "Subscribe"}
          </button>
        </div>
      </form>
       {message && (
        <p className="text-sm text-gray-800 dark:text-gray-800 font-medium mt-3 z-10">{message}</p>
      )}

    </div>
  );
}