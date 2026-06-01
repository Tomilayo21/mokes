"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const roles = [
  {
    title: "Frontend Developer",
    type: "Full-Time",
    location: "Remote / Lagos",
    description:
      "Build and maintain high-performance UI components for Mokés e-commerce platform using React and Next.js.",
    requirements: [
      "Strong experience with React & Next.js",
      "Good understanding of UI/UX principles",
      "Experience with REST APIs",
      "Attention to detail and performance optimization",
    ],
  },
  {
    title: "UI/UX Designer",
    type: "Full-Time",
    location: "Remote",
    description:
      "Design elegant, minimal, and conversion-focused user experiences for our fashion e-commerce platform.",
    requirements: [
      "Experience with Figma or similar tools",
      "Strong portfolio of web/mobile designs",
      "Understanding of e-commerce UX patterns",
      "Ability to work with developers",
    ],
  },
  {
    title: "E-commerce Operations Manager",
    type: "Full-Time",
    location: "Lagos",
    description:
      "Oversee product listings, inventory flow, orders, and customer experience across the Mokés store.",
    requirements: [
      "Experience in e-commerce operations",
      "Strong organizational skills",
      "Knowledge of inventory systems",
      "Customer-first mindset",
    ],
  },
  {
    title: "Digital Marketing Specialist",
    type: "Full-Time",
    location: "Remote",
    description:
      "Drive traffic, engagement, and conversions through social media, ads, and email marketing campaigns.",
    requirements: [
      "Experience with Meta Ads / Google Ads",
      "Content marketing skills",
      "Analytics and performance tracking",
      "Fashion or lifestyle brand experience is a plus",
    ],
  },
];

const OpenRolesPage = () => {
  return (
    <>
      <Navbar />

      <div className="px-8 md:px-8 lg:px-8 pt-10 mt-8 mb-20">

        {/* Header */}
        <div className="relative mb-12 border-b border-gray-200 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              Open Roles
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              Join Mokés and help us shape the future of modern fashion and e-commerce experiences.
            </p>
          </div>
        </div>

        {/* Intro */}
        <section className="max-w-5xl mx-auto mb-16">
          <p className="text-gray-600 leading-8">
            At Mokés, we are building more than a fashion brand — we are building a modern digital experience
            where style meets technology. We are always looking for passionate, creative, and driven individuals
            to join our growing team.
          </p>

          <p className="mt-6 text-gray-600 leading-8">
            If you are excited about fashion, technology, and building meaningful products, we would love to hear from you.
          </p>
        </section>

        {/* Why Join Us */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-3xl font-light text-gray-900 mb-8">
              Why Work With Mokés?
            </h2>

            <div className="grid md:grid-cols-3 gap-8 text-gray-600">

              <div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">
                  Creative Freedom
                </h3>
                <p className="leading-7">
                  We encourage new ideas, experimentation, and creative thinking across all teams.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">
                  Growth Opportunities
                </h3>
                <p className="leading-7">
                  Work in a fast-growing environment where your skills evolve quickly.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">
                  Impact-Driven Work
                </h3>
                <p className="leading-7">
                  Everything you build directly impacts thousands of customers.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Roles */}
        <section className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-center text-gray-900 mb-12">
            Current Openings
          </h2>

          <div className="space-y-8">

            {roles.map((role, index) => (
              <div
                key={index}
                className="border border-gray-200 p-8 hover:shadow-sm transition bg-white"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>
                    <h3 className="text-xl font-normal text-gray-900">
                      {role.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {role.type} • {role.location}
                    </p>

                    <p className="text-gray-600 mt-4 leading-7 max-w-3xl">
                      {role.description}
                    </p>
                  </div>

                  <button className="px-6 py-3 bg-[var(--sage)] text-white uppercase text-sm hover:bg-zinc-500 transition rounded-sm">
                    Apply Now
                  </button>

                </div>

                <div className="mt-6">
                  <h4 className="text-gray-900 font-medium mb-3">
                    Requirements
                  </h4>

                  <ul className="list-disc pl-6 space-y-2 text-gray-600 leading-7">
                    {role.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* Application Note */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-3xl font-light text-gray-900 mb-6">
              How To Apply
            </h2>

            <p className="text-gray-600 leading-8 max-w-3xl mx-auto">
              To apply for any of the roles above, click the “Apply Now” button
              and send your CV along with a short introduction about yourself.
              Our team will review your application and get back to you if you are shortlisted.
            </p>

          </div>
        </section>

        {/* Closing */}
        <section className="text-center py-16 border-t border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Build The Future With Us
          </h2>

          <p className="max-w-3xl mx-auto text-gray-600 leading-8">
            Mokés is growing, and we are always looking for talented individuals
            who are passionate about fashion, technology, and innovation.
            If that sounds like you, we’d love to meet you.
          </p>

        </section>

      </div>

      <Footer />
    </>
  );
};

export default OpenRolesPage;
