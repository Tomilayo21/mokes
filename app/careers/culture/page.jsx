"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CulturePage = () => {
  return (
    <>
      <Navbar />

      <div className="px-8 md:px-8 lg:px-8 pt-10 mt-8 mb-20">

        {/* Header */}
        <div className="relative mb-12 border-b border-gray-200 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              Our Culture
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              The values, mindset, and people behind Mokés.
            </p>
          </div>
        </div>

        {/* Intro */}
        <section className="max-w-5xl mx-auto mb-16">
          <p className="text-gray-600 leading-8">
            At Mokés, culture is not something we define once — it is something we live every day.
            It shapes how we design, how we build, how we treat customers, and how we treat each other.
          </p>

          <p className="mt-6 text-gray-600 leading-8">
            We are a team driven by simplicity, creativity, and an obsession with detail. Whether it is a product
            page, a new collection, or a customer message, we approach everything with intention.
          </p>
        </section>

        {/* Philosophy */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-3xl font-light text-gray-900 mb-8">
              Our Philosophy
            </h2>

            <p className="text-gray-600 leading-8 max-w-3xl mx-auto">
              We believe great products come from clarity, not complexity. Every design decision at Mokés
              is intentional — minimal, functional, and focused on elevating everyday style.
            </p>

          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-center text-gray-900 mb-12">
            What We Believe In
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="border border-gray-200 p-8">
              <h3 className="text-xl font-normal text-gray-900 mb-3">
                Simplicity
              </h3>
              <p className="text-gray-600 leading-7">
                We remove noise and focus on what truly matters — clean design, effortless fashion, and clarity in everything we build.
              </p>
            </div>

            <div className="border border-gray-200 p-8">
              <h3 className="text-xl font-normal text-gray-900 mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 leading-7">
                We are committed to quality in every detail — from product selection to user experience to customer support.
              </p>
            </div>

            <div className="border border-gray-200 p-8">
              <h3 className="text-xl font-normal text-gray-900 mb-3">
                Consistency
              </h3>
              <p className="text-gray-600 leading-7">
                We believe trust is built through consistency — in design, service, and the experience we deliver every day.
              </p>
            </div>

          </div>
        </section>

        {/* Work Culture */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-8">
            How We Work
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              We work in a fast-moving but thoughtful environment. Speed matters, but clarity matters more.
            </p>

            <p>
              Every idea is discussed, refined, and improved collaboratively. We believe the best solutions come from
              open communication and shared ownership.
            </p>

            <p>
              There are no unnecessary layers or bureaucracy — just a team focused on building a better shopping experience
              for every customer who visits Mokés.
            </p>
          </div>
        </section>

        {/* Environment */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Our Environment
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                We encourage creativity, independence, and accountability.
              </p>

              <p>
                Everyone on the team is trusted to take ownership of their work and contribute ideas that shape the direction of Mokés.
              </p>

              <p>
                We value learning, experimentation, and continuous improvement — both as individuals and as a company.
              </p>
            </div>

          </div>
        </section>

        {/* Team Mindset */}
        <section className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-8">
            Team Mindset
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              We think like builders. Every feature, design, and interaction is an opportunity to improve the experience.
            </p>

            <p>
              We think like customers. If it doesn’t feel simple, intuitive, or valuable, we rethink it.
            </p>

            <p>
              We think long-term. We don’t chase shortcuts — we build systems that last and scale.
            </p>
          </div>
        </section>

        {/* What Makes Us Different */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-16">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-3xl font-light text-gray-900 mb-8">
              What Makes Mokés Different
            </h2>

            <p className="text-gray-600 leading-8 max-w-3xl mx-auto">
              We are not just another fashion store. We are building a refined, intentional shopping experience where
              every product, interaction, and design choice is carefully considered.
            </p>

          </div>
        </section>

        {/* Closing */}
        <section className="text-center py-16 border-t border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-6">
            Built With Intention
          </h2>

          <p className="max-w-3xl mx-auto text-gray-600 leading-8">
            Mokés culture is shaped by people who care deeply about craft, detail, and experience.
            As we grow, we remain committed to staying intentional, simple, and focused on excellence.
          </p>

        </section>

      </div>

      <Footer />
    </>
  );
};

export default CulturePage;