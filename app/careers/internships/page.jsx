"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const internships = [
  {
    title: "Frontend Engineering Intern",
    duration: "3–6 Months",
    location: "Remote / Lagos",
    description:
      "Work with our engineering team to build and improve Mokés UI using React and Next.js.",
    highlights: [
      "Real-world production experience",
      "Work on live e-commerce features",
      "Mentorship from senior developers",
      "Build portfolio-worthy projects",
    ],
  },
  {
    title: "UI/UX Design Intern",
    duration: "3–6 Months",
    location: "Remote",
    description:
      "Assist in designing clean, modern, and conversion-focused user experiences for Mokés platform.",
    highlights: [
      "Hands-on product design experience",
      "Work on real customer flows",
      "Figma-based design system exposure",
      "Feedback from design leads",
    ],
  },
  {
    title: "Marketing & Content Intern",
    duration: "3 Months",
    location: "Remote / Hybrid",
    description:
      "Support content creation, social media campaigns, and brand storytelling for Mokés.",
    highlights: [
      "Social media strategy experience",
      "Content creation & branding",
      "Analytics & engagement tracking",
      "Exposure to fashion marketing",
    ],
  },
  {
    title: "E-commerce Operations Intern",
    duration: "3–6 Months",
    location: "Lagos",
    description:
      "Learn how a modern e-commerce platform runs — from inventory to orders and customer experience.",
    highlights: [
      "Order & inventory management",
      "Customer support workflows",
      "Logistics coordination",
      "Backend operations exposure",
    ],
  },
];

const InternshipsPage = () => {
  return (
    <>
      <Navbar />

      <div className="px-8 md:px-8 lg:px-8 pt-10 mt-8 mb-20">

        {/* Header */}
        <div className="relative mb-12 border-b border-gray-200 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              Internships
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              Learn, build, and grow with Mokés through hands-on internship opportunities.
            </p>
          </div>
        </div>

        {/* Intro */}
        <section className="max-w-5xl mx-auto mb-16">
          <p className="text-gray-600 leading-8">
            At Mokés, we believe in nurturing the next generation of builders, designers, marketers, and innovators.
            Our internship program is designed to give you real-world experience working on a fast-growing e-commerce platform.
          </p>

          <p className="mt-6 text-gray-600 leading-8">
            You won’t just observe — you’ll contribute, build, and ship real features that impact real users.
          </p>
        </section>

        {/* Why Intern With Us */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-3xl font-light text-gray-900 mb-8">
              Why Intern at Mokés?
            </h2>

            <div className="grid md:grid-cols-3 gap-8 text-gray-600">

              <div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">
                  Real Experience
                </h3>
                <p className="leading-7">
                  Work on real features used by actual customers — not dummy projects.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">
                  Mentorship
                </h3>
                <p className="leading-7">
                  Learn directly from experienced developers, designers, and operators.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">
                  Career Growth
                </h3>
                <p className="leading-7">
                  High-performing interns may be offered full-time roles.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* Internship Listings */}
        <section className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-center text-gray-900 mb-12">
            Available Internship Programs
          </h2>

          <div className="space-y-8">

            {internships.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 p-8 bg-white hover:shadow-sm transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>
                    <h3 className="text-xl font-normal text-gray-900">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {item.duration} • {item.location}
                    </p>

                    <p className="text-gray-600 mt-4 leading-7 max-w-3xl">
                      {item.description}
                    </p>
                  </div>

                  <button className="px-6 py-3 bg-[var(--sage)] text-white uppercase text-sm hover:bg-zinc-500 transition rounded-sm">
                    Apply Now
                  </button>

                </div>

                <div className="mt-6">
                  <h4 className="text-gray-900 font-medium mb-3">
                    What You’ll Learn
                  </h4>

                  <ul className="list-disc pl-6 space-y-2 text-gray-600 leading-7">
                    {item.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

          </div>
        </section>

        {/* Requirements */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-3xl font-light text-gray-900 mb-8">
              General Requirements
            </h2>

            <div className="text-gray-600 leading-8 space-y-4">
              <p>We welcome applicants who are:</p>

              <ul className="list-disc pl-6 text-left max-w-2xl mx-auto space-y-3">
                <li>Passionate about learning and building</li>
                <li>Comfortable working in a fast-paced environment</li>
                <li>Good communicators and team players</li>
                <li>Basic knowledge in their chosen field (varies by role)</li>
              </ul>

            </div>

          </div>
        </section>

        {/* Application */}
        <section className="text-center py-16 border-t border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            How To Apply
          </h2>

          <p className="max-w-3xl mx-auto text-gray-600 leading-8">
            To apply, click on any internship role and submit your CV along with a short introduction about yourself.
            Tell us what excites you about Mokés and what you want to learn.
          </p>

          <button className="mt-8 px-8 py-3 uppercase text-white bg-[var(--sage)] hover:bg-zinc-500 transition rounded-sm">
            Start Application
          </button>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default InternshipsPage;