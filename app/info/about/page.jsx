"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";   

const AboutPage = () => {
    const router = useRouter();
  return (
    <>
      <Navbar />

      <div className="px-8 md:px-8 lg:px-8 pt-10 mt-8 mb-20">

        {/* Header */}
        <div className="relative mb-12 border-b border-gray-200 pb-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              About Mokés
            </h1>

            <p className="text-sm md:text-base text-gray-500 mt-2 max-w-2xl">
              Crafting timeless fashion with confidence, quality, and modern
              sophistication.
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <section className="max-w-6xl mx-auto mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>
              <h2 className="text-3xl md:text-5xl font-light text-gray-900 leading-tight">
                Fashion That Speaks Before You Do
              </h2>

              <p className="mt-6 text-gray-600 leading-8">
                At Mokés, we believe clothing is more than fabric and stitching.
                It is confidence. It is expression. It is identity.
              </p>

              <p className="mt-4 text-gray-600 leading-8">
                Every collection we create is designed with a simple purpose:
                to help individuals express themselves effortlessly through
                quality fashion that feels as good as it looks.
              </p>

              <p className="mt-4 text-gray-600 leading-8">
                Whether you're dressing for everyday comfort, making a statement,
                or celebrating life's important moments, Mokés is committed to
                bringing you pieces that elevate your style without compromising
                quality or comfort.
              </p>
            </div>

            <div>
              <img
                src="/redicul-pict-ggcJKGpx3pI-unsplash.jpg"
                alt="Mokés Fashion"
                className="w-full object-cover rounded-sm"
              />
            </div>

          </div>
        </section>

        {/* Story */}
        <section className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-center text-gray-900 mb-10">
            Our Story
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              Mokés was founded with a vision to redefine online fashion by
              creating a shopping experience that combines premium quality,
              exceptional service, and carefully curated collections.
            </p>

            <p>
              What began as a simple idea quickly evolved into a growing brand
              dedicated to helping people discover clothing that reflects their
              individuality. We recognized that fashion should not only follow
              trends but also empower people to feel comfortable and confident
              in their own skin.
            </p>

            <p>
              From day one, our focus has remained unchanged: provide products
              that deliver exceptional value while maintaining high standards of
              craftsmanship and customer satisfaction.
            </p>

            <p>
              Today, Mokés continues to grow while staying true to the principles
              that inspired its creation. We work tirelessly to ensure that every
              product featured in our collections meets our expectations for
              style, durability, and comfort.
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-20">
          <div className="max-w-5xl mx-auto text-center">

            <h2 className="text-3xl font-light text-gray-900 mb-8">
              Our Mission
            </h2>

            <p className="text-lg leading-9 text-gray-600">
              To inspire confidence through thoughtfully curated fashion,
              delivering premium-quality products and an exceptional shopping
              experience that customers can trust.
            </p>

          </div>
        </section>

        {/* Core Values */}
        <section className="max-w-6xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-center text-gray-900 mb-14">
            What We Stand For
          </h2>

          <div className="grid md:grid-cols-3 gap-10">

            <div className="border border-gray-200 p-8">
              <h3 className="text-xl mb-4 font-normal text-gray-900">
                Quality First
              </h3>

              <p className="text-gray-600 leading-7">
                We carefully select products that meet our standards for
                craftsmanship, durability, and comfort, ensuring every purchase
                feels worthwhile.
              </p>
            </div>

            <div className="border border-gray-200 p-8">
              <h3 className="text-xl mb-4 font-normal text-gray-900">
                Customer Focused
              </h3>

              <p className="text-gray-600 leading-7">
                Every decision we make is guided by our commitment to delivering
                a seamless and satisfying customer experience.
              </p>
            </div>

            <div className="border border-gray-200 p-8">
              <h3 className="text-xl mb-4 font-normal text-gray-900">
                Authentic Style
              </h3>

              <p className="text-gray-600 leading-7">
                We believe fashion should celebrate individuality and provide
                people with the freedom to express themselves confidently.
              </p>
            </div>

          </div>
        </section>

        {/* Quality Promise */}
        <section className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-8">
            Our Quality Promise
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              We understand that trust is earned. That's why we carefully review
              every product before it becomes part of the Mokes collection.
            </p>

            <p>
              Our commitment extends beyond aesthetics. We focus on fit,
              durability, comfort, and overall customer satisfaction to ensure
              every item meets the expectations of modern shoppers.
            </p>

            <p>
              By maintaining rigorous quality standards, we strive to create an
              experience where customers can shop with complete confidence.
            </p>
          </div>
        </section>

        {/* Sustainability */}
        <section className="bg-gray-50 py-16 px-8 rounded-sm mb-20">
          <div className="max-w-5xl mx-auto">

            <h2 className="text-3xl font-light text-center text-gray-900 mb-8">
              Sustainability & Responsibility
            </h2>

            <div className="space-y-6 text-gray-600 leading-8">
              <p>
                We recognize the importance of responsible business practices and
                continue exploring ways to reduce environmental impact while
                delivering products our customers love.
              </p>

              <p>
                Through thoughtful sourcing, efficient operations, and a focus on
                long-lasting quality, we aim to contribute positively to a more
                sustainable future for fashion.
              </p>

              <p>
                Sustainability is a journey, and we remain committed to improving
                our practices as we grow.
              </p>
            </div>

          </div>
        </section>

        {/* Customer Commitment */}
        <section className="max-w-5xl mx-auto mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-8">
            Our Commitment To You
          </h2>

          <div className="space-y-6 text-gray-600 leading-8">
            <p>
              Every customer is at the heart of what we do.
            </p>

            <p>
              From the moment you browse our collections to the moment your order
              arrives at your doorstep, we strive to provide a shopping experience
              that is simple, reliable, and enjoyable.
            </p>

            <p>
              Our team continuously works behind the scenes to improve product
              selection, streamline delivery, and ensure responsive customer
              support whenever you need assistance.
            </p>

            <p>
              Your trust motivates us to keep raising the standard and delivering
              an experience worthy of your loyalty.
            </p>
          </div>
        </section>

        {/* Vision */}
        <section className="text-center py-16 border-t border-gray-200">
          <h2 className="text-3xl font-light text-gray-900 mb-8">
            Looking Ahead
          </h2>

          <p className="max-w-4xl mx-auto text-gray-600 leading-8">
            As Mokés continues to grow, our vision remains clear: to become a
            trusted destination for fashion enthusiasts seeking quality,
            authenticity, and confidence in every purchase. We are excited about
            the future and grateful to have you as part of our journey.
          </p>

          <button
            onClick={() => router.push("/collections/all")}
            className="mt-10 px-8 py-3 uppercase text-white bg-[var(--sage)] hover:bg-zinc-500 transition rounded-sm"
          >
            Explore Collection
          </button>
        </section>

      </div>

      <Footer />
    </>
  );
};

export default AboutPage;