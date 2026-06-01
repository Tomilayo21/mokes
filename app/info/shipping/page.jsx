"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ShippingPage = () => {
  return (
    <>
      <Navbar />

      <div className="px-8 md:px-8 lg:px-8 pt-10 mt-8 mb-20">

        {/* Header */}
        <div className="relative mb-12 border-b border-gray-200 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              Shipping Information
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              Everything you need to know about how Mokés delivers your orders safely and efficiently.
            </p>
          </div>
        </div>

        {/* Intro */}
        <section className="max-w-5xl mx-auto mb-16">
          <p className="text-gray-600 leading-8">
            At Mokés, we understand that once you place an order, the next most important thing is receiving it quickly,
            safely, and in perfect condition. That’s why we’ve designed a reliable shipping process that ensures your
            items are carefully packaged and delivered with care.
          </p>

          <p className="mt-6 text-gray-600 leading-8">
            This page provides a full breakdown of our shipping timelines, fees, delivery process, and what you can
            expect after placing an order on our store.
          </p>
        </section>

        {/* Processing Time */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Order Processing Time
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              All orders placed on Mokés are processed within <span className="font-medium text-gray-900">24–72 hours</span>
              (excluding weekends and public holidays).
            </p>

            <p>
              During high-demand periods such as sales or festive seasons, processing may take slightly longer.
              However, we always prioritize efficiency to ensure your order is dispatched as quickly as possible.
            </p>

            <p>
              Once your order has been processed and packed, you will receive a confirmation notification indicating
              that your order is ready for shipment.
            </p>
          </div>
        </section>

        {/* Delivery Time */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-10">
              Delivery Timeframes
            </h2>

            <div className="grid md:grid-cols-2 gap-10 text-gray-600">

              <div className="border border-gray-200 p-6 bg-white">
                <h3 className="text-xl font-normal text-gray-900 mb-3">
                  Within Nigeria
                </h3>
                <p className="leading-7">
                  Delivery typically takes <span className="font-medium text-gray-900">2–5 business days</span> 
                  depending on your location. Major cities like Lagos, Abuja, and Port Harcourt may receive
                  orders faster due to logistics accessibility.
                </p>
              </div>

              <div className="border border-gray-200 p-6 bg-white">
                <h3 className="text-xl font-normal text-gray-900 mb-3">
                  International Orders
                </h3>
                <p className="leading-7">
                  International delivery takes approximately <span className="font-medium text-gray-900">5–12 business days</span> 
                  depending on customs clearance and destination country regulations.
                </p>
              </div>

            </div>

            <p className="mt-8 text-center text-gray-500 text-sm">
              Delivery times are estimates and may vary depending on external logistics conditions.
            </p>

          </div>
        </section>

        {/* Shipping Fees */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Shipping Fees
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              Shipping costs are calculated based on your location, order size, and selected delivery method.
            </p>

            <p>
              For orders within Nigeria, standard shipping fees are applied at checkout. Occasionally, Mokés offers
              free shipping promotions on selected items or minimum order values.
            </p>

            <p>
              International shipping fees vary depending on destination country and will be displayed clearly before
              payment confirmation.
            </p>
          </div>
        </section>

        {/* Tracking */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Order Tracking
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                Once your order has been shipped, you will receive a tracking number via email or SMS.
              </p>

              <p>
                This tracking number allows you to monitor your delivery status in real-time through our logistics partner.
              </p>

              <p>
                If you experience any difficulty tracking your order, our support team is always available to assist you.
              </p>
            </div>

          </div>
        </section>

        {/* Delivery Conditions */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Delivery Conditions
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              Please ensure that your shipping details are accurate and complete when placing your order.
              Mokés will not be responsible for delays or failed deliveries caused by incorrect address information.
            </p>

            <p>
              If a package is returned due to an incorrect address or failed delivery attempts,
              additional shipping fees may apply for resending.
            </p>

            <p>
              We recommend ensuring someone is available at the delivery location to receive the package.
            </p>
          </div>
        </section>

        {/* Delays */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Possible Delays
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              While we strive for fast and reliable delivery, certain factors beyond our control may cause delays.
              These include weather conditions, courier disruptions, customs inspections, or peak holiday periods.
            </p>

            <p>
              In such cases, we work closely with our logistics partners to ensure your order reaches you as soon as possible.
            </p>
          </div>
        </section>

        {/* Customer Support */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16 text-center">
          <div className="max-w-4xl mx-auto">

            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Need Help With Your Order?
            </h2>

            <p className="text-gray-600 leading-8">
              If you have any questions about shipping, delivery status, or order issues, our support team is here to help.
              We are committed to ensuring a smooth and stress-free shopping experience.
            </p>

            <button
              className="mt-8 px-8 py-3 uppercase text-white bg-[var(--sage)] hover:bg-zinc-500 transition rounded-sm"
            >
              Contact Support
            </button>

          </div>
        </section>

        {/* Closing */}
        <section className="text-center py-10 border-t border-gray-200">
          <p className="max-w-3xl mx-auto text-gray-600 leading-8">
            Mokés is committed to delivering not just fashion, but a seamless experience from checkout to delivery.
            Thank you for trusting us — we look forward to getting your order to you safely and on time.
          </p>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default ShippingPage;
