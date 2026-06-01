"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ReturnsPage = () => {
  return (
    <>
      <Navbar />

      <div className="px-8 md:px-8 lg:px-8 pt-10 mt-8 mb-20">

        {/* Header */}
        <div className="relative mb-12 border-b border-gray-200 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              Returns & Refund Policy
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              Understanding how returns, exchanges, and refunds work at Mokés.
            </p>
          </div>
        </div>

        {/* Intro */}
        <section className="max-w-5xl mx-auto mb-16">
          <p className="text-gray-600 leading-8">
            At Mokés, we want you to feel completely confident with every purchase.
            If something isn’t right with your order, we’re here to help make it right.
            This Returns & Refund Policy explains how we handle returns, exchanges, and refunds in a fair and transparent way.
          </p>

          <p className="mt-6 text-gray-600 leading-8">
            Please read this policy carefully before initiating a return request.
          </p>
        </section>

        {/* Return Eligibility */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Return Eligibility
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              To be eligible for a return, your item must meet the following conditions:
            </p>

            <ul className="list-disc pl-6 space-y-3">
              <li>The item must be unused, unworn, and in its original condition.</li>
              <li>All tags, packaging, and accessories must be intact.</li>
              <li>The return request must be made within <span className="font-medium text-gray-900">7 days</span> of delivery.</li>
              <li>Items marked as final sale or clearance are not eligible for return.</li>
            </ul>

            <p>
              Mokés reserves the right to reject returns that do not meet these conditions.
            </p>
          </div>
        </section>

        {/* Non-returnable Items */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Non-Returnable Items
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                Certain items cannot be returned due to hygiene, customization, or promotional reasons.
              </p>

              <ul className="list-disc pl-6 space-y-3">
                <li>Underwear, socks, and swimwear (for hygiene reasons)</li>
                <li>Customized or personalized items</li>
                <li>Items purchased during clearance or flash sales</li>
                <li>Gift cards or digital products</li>
              </ul>

            </div>

          </div>
        </section>

        {/* Return Process */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            How To Request A Return
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              Initiating a return with Mokés is simple and straightforward:
            </p>

            <ol className="list-decimal pl-6 space-y-3">
              <li>Contact our support team within 7 days of receiving your order.</li>
              <li>Provide your order number and reason for return.</li>
              <li>Our team will review your request and approve if eligible.</li>
              <li>Pack the item securely in its original packaging.</li>
              <li>Ship the item back using the instructions provided.</li>
            </ol>

            <p>
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund.
            </p>
          </div>
        </section>

        {/* Refund Policy */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Refund Policy
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                Once your return is approved, your refund will be processed within
                <span className="font-medium text-gray-900"> 5–10 business days</span>.
              </p>

              <p>
                Refunds are issued to the original payment method used during checkout.
              </p>

              <p>
                Depending on your bank or payment provider, additional processing time may be required before the refund reflects in your account.
              </p>

              <p>
                Shipping fees are non-refundable unless the return is due to an error on our part (e.g., wrong or defective item sent).
              </p>
            </div>

          </div>
        </section>

        {/* Exchanges */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Exchanges
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              We currently offer exchanges for size or color, subject to stock availability.
            </p>

            <p>
              If you would like to exchange an item, please follow the return process and indicate the item you would prefer instead.
            </p>

            <p>
              If the requested replacement is unavailable, a refund will be issued instead.
            </p>
          </div>
        </section>

        {/* Damaged or Wrong Items */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Damaged or Incorrect Items
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              We sincerely apologize if you receive a damaged or incorrect item.
              Please contact us immediately with clear photos of the issue.
            </p>

            <p>
              Once verified, we will arrange a replacement or full refund at no additional cost to you.
            </p>

            <p>
              Mokés is committed to ensuring that every customer receives exactly what they ordered in perfect condition.
            </p>
          </div>
        </section>

        {/* Return Shipping */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Return Shipping
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                Customers are responsible for return shipping costs unless the return is due to our error.
              </p>

              <p>
                We recommend using a trackable shipping service, as we cannot guarantee receipt of returned items without tracking.
              </p>

              <p>
                Mokés is not responsible for lost or damaged return shipments.
              </p>
            </div>

          </div>
        </section>

        {/* Support */}
        <section className="text-center py-16 border-t border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Need Help With A Return?
          </h2>

          <p className="max-w-3xl mx-auto text-gray-600 leading-8">
            If you have any questions about returns, refunds, or exchanges, our support team is here to assist you.
            We aim to make every resolution smooth, fair, and stress-free.
          </p>

          <button className="mt-8 px-8 py-3 uppercase text-white bg-[var(--sage)] hover:bg-zinc-500 transition rounded-sm">
            Contact Support
          </button>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default ReturnsPage;