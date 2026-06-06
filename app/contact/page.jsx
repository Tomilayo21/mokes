"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";


const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Submission failed");

      setFormData({ name: "", email: "", subject: "", message: "" });

      toast.custom((t) => (
        <div
          className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
            t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-green-700">
              Message sent successfully
            </p>
            <p className="text-xs text-gray-500 mt-1">
              We’ll get back to you shortly.
            </p>
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-black"
          >
            ✕
          </button>

          {/* progress bar */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
            <div
              className="h-full bg-[var(--sage)]"
              style={{
                animation: `toast-progress ${t.duration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ), {
        duration: 4000,
        position: "top-right",
      });

    } catch (err) {
      toast.custom((t) => (
        <div
          className={`relative overflow-hidden max-w-md w-full bg-white border border-red-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
            t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
          }`}
        >
          <div className="flex-1">
            <p className="text-sm font-medium text-red-600">
              Message failed
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {err.message}
            </p>
          </div>

          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 hover:text-black"
          >
            ✕
          </button>

          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
            <div
              className="h-full bg-red-500"
              style={{
                animation: `toast-progress ${4000}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ), {
        duration: 4000,
        position: "top-right",
      });

    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="flex flex-col items-center mt-12 pb-20 px-6 md:px-16 lg:px-32 pt-16">

        {/* HEADER */}
        <div className="text-center mb-14">
          <p className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
            Get in Touch
          </p>

          <div className="w-16 h-[1px] bg-black mx-auto my-5 opacity-30" />

          <p className="text-gray-600 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Whether you have a question, feedback, or want to collaborate — we’d love to hear from you.
            Our team will respond as soon as possible.
          </p>
        </div>

        {/* FORM CARD */}
        <div className="w-full max-w-2xl bg-white border border-gray-200 shadow-sm rounded-sm p-8 md:p-10">

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* NAME */}
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-sm
                focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-sm
                focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* SUBJECT */}
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={handleChange}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-sm
                focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Message
              </label>
              <textarea
                name="message"
                placeholder="Write your message..."
                rows={6}
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-2 w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 rounded-sm
                focus:outline-none focus:border-black focus:bg-white transition resize-none"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-5 py-3 text-sm border-t border-zinc-300 
                cursor-pointer bg-[var(--sage)] text-white 
                hover:bg-zinc-500 transition uppercase
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending Message..." : "Send Message"}
            </button>

            {/* RESPONSE */}
            {response && (
              <p
                className={`text-center text-sm font-medium ${
                  response.type === "error" ? "text-red-500" : "text-green-600"
                }`}
              >
                {response.message}
              </p>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
