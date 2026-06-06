"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

const PrivacyPolicyPage = () => {
  const router = useRouter();

  return (
    <>
      <Navbar />

      <div className="px-8 md:px-8 lg:px-8 pt-10 mt-8 mb-20">

        {/* Header */}
        <div className="relative mb-12 border-b border-gray-200 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              Privacy Policy
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              How Mokés collects, uses, and protects your personal information.
            </p>
          </div>
        </div>

        {/* Intro */}
        <section className="max-w-5xl mx-auto mb-16">
          <p className="text-gray-600 leading-8">
            At Mokés, your privacy is extremely important to us. This Privacy Policy explains how we collect,
            use, store, and protect your personal data when you interact with our website, make purchases,
            or communicate with us.
          </p>

          <p className="mt-6 text-gray-600 leading-8">
            By using our services, you agree to the terms outlined in this policy.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Information We Collect
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>We may collect the following types of information:</p>

            <ul className="list-disc pl-6 space-y-3">
              <li>
                <span className="font-medium text-gray-900">Personal Information:</span> Name, email address, phone number, shipping address.
              </li>
              <li>
                <span className="font-medium text-gray-900">Order Information:</span> Products purchased, payment details, and transaction history.
              </li>
              <li>
                <span className="font-medium text-gray-900">Technical Data:</span> IP address, browser type, device information, and usage patterns.
              </li>
              <li>
                <span className="font-medium text-gray-900">Communication Data:</span> Messages sent through customer support or contact forms.
              </li>
            </ul>
          </div>
        </section>

        {/* How We Use Data */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              How We Use Your Information
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>We use your data to:</p>

              <ul className="list-disc pl-6 space-y-3">
                <li>Process and deliver your orders efficiently</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our website, services, and user experience</li>
                <li>Send order updates, promotions, and important notifications</li>
                <li>Prevent fraud and enhance security</li>
              </ul>

            </div>

          </div>
        </section>

        {/* Data Sharing */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Data Sharing
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              Mokés does not sell your personal information.
            </p>

            <p>
              We may share your data only with trusted third parties necessary to operate our business, such as:
            </p>

            <ul className="list-disc pl-6 space-y-3">
              <li>Payment processors (for secure transactions)</li>
              <li>Shipping and logistics partners</li>
              <li>Analytics providers (to improve performance)</li>
              <li>Customer support tools</li>
            </ul>

            <p>
              All third-party services are required to protect your data and use it only for authorized purposes.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Cookies & Tracking
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                Our website uses cookies to enhance your browsing experience.
              </p>

              <p>
                Cookies help us remember your preferences, analyze site traffic, and provide personalized content.
              </p>

              <p>
                You can choose to disable cookies through your browser settings, but some features of the site may not function properly.
              </p>
            </div>

          </div>
        </section>

        {/* Data Security */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Data Security
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              We take appropriate technical and organizational measures to protect your personal data from
              unauthorized access, alteration, disclosure, or destruction.
            </p>

            <p>
              While we strive to use commercially acceptable means to protect your data, no method of transmission
              over the internet is 100% secure.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Your Rights
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>You have the right to:</p>

            <ul className="list-disc pl-6 space-y-3">
              <li>Access the personal data we hold about you</li>
              <li>Request corrections to inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt out of marketing communications at any time</li>
            </ul>
          </div>
        </section>

        {/* Data Retention */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Data Retention
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy,
                including legal, accounting, and reporting requirements.
              </p>

              <p>
                When data is no longer needed, it is securely deleted or anonymized.
              </p>
            </div>

          </div>
        </section>

        {/* Third Party Links */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Third-Party Links
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              Our website may contain links to third-party websites.
            </p>

            <p>
              Mokés is not responsible for the privacy practices or content of these external sites.
              We encourage you to review their privacy policies before providing any personal information.
            </p>
          </div>
        </section>

        {/* Updates */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Policy Updates
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
              </p>

              <p>
                Any updates will be posted on this page with a revised “last updated” date.
              </p>
            </div>

          </div>
        </section>

        {/* Contact */}
        <section className="text-center py-16 border-t border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Contact Us
          </h2>

          <p className="max-w-3xl mx-auto text-gray-600 leading-8">
            If you have any questions about this Privacy Policy or how your data is handled,
            please contact our support team. We are always here to help.
          </p>

          <button 
              onClick={() => router.push("/contact")}
              className="mt-8 px-8 py-3 uppercase cursor-pointer text-white bg-[var(--sage)] hover:bg-zinc-500 transition rounded-sm"
            >
            Contact Support
          </button>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;