"use client";
import React from "react";
import { motion } from "framer-motion";

const Loading = ({ type = "default" }) => {
  const renderSkeleton = () => {
    switch (type) {
      case "checkout":
        return <CheckoutSkeleton />;
      case "dashboard":
        return <DashboardSkeleton />;
      case "product":
        return <ProductSkeleton />;
      case "table":
        return <TableSkeleton />;
      case "cart":
        return <CartSkeleton />;
      default:
        return <DefaultSkeleton />;
    }
  };

  return (
    <motion.div
      className="w-full h-[70vh] flex flex-col space-y-6 px-4"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.8, repeat: Infinity }}
    >
      {renderSkeleton()}
    </motion.div>
  );
};

const SkeletonBox = ({ className }) => {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-gray-200 ${className}`}>
      <div className="absolute inset-0 animate-pulse opacity-70" />

      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
        animate={{ x: ["0%", "200%"] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

const CheckoutSkeleton = () => (
  <>
    <SkeletonBox className="h-6 w-1/3" />

    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <SkeletonBox className="h-12 w-full" />
        <SkeletonBox className="h-12 w-full" />
        <SkeletonBox className="h-12 w-full" />
        <SkeletonBox className="h-32 w-full" />
      </div>

      <div className="space-y-3">
        <SkeletonBox className="h-6 w-1/2" />
        <SkeletonBox className="h-24 w-full" />
        <SkeletonBox className="h-10 w-full" />
      </div>
    </div>
  </>
);

const DashboardSkeleton = () => (
  <>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SkeletonBox className="h-20 w-full" />
      <SkeletonBox className="h-20 w-full" />
      <SkeletonBox className="h-20 w-full" />
      <SkeletonBox className="h-20 w-full" />
    </div>

    <SkeletonBox className="h-64 w-full" />
    <SkeletonBox className="h-40 w-full" />
  </>
);

const ProductSkeleton = () => (
  <div className="flex flex-col bg-white mt-12 text-black dark:bg-white dark:text-black min-h-screen text-black dark:bg-white dark:text-black min-h-screen">
    <div className="px-4 md:px-16 lg:px-32 space-y-8">
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        
        {/* LEFT SIDE */}
        <div className="space-y-4">
          <SkeletonBox className="h-[280px] sm:h-[350px] md:h-[400px] w-full rounded-md" />

          {/* thumbnails */}
          <div className="flex gap-3 overflow-hidden">
            <SkeletonBox className="h-20 w-20 rounded-md" />
            <SkeletonBox className="h-20 w-20 rounded-md hidden sm:block" />
            <SkeletonBox className="h-20 w-20 rounded-md hidden sm:block" />
            <SkeletonBox className="h-20 w-20 rounded-md hidden md:block" />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col space-y-5">

          {/* title */}
          <SkeletonBox className="h-8 w-full md:w-3/4" />

          {/* price */}
          <div className="flex gap-3">
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-5 w-20" />
          </div>

          {/* size selector */}
          <div className="space-y-2">
            <SkeletonBox className="h-12 w-full" />
            <div className="grid grid-cols-4 gap-2">
              <SkeletonBox className="h-10 w-full" />
              <SkeletonBox className="h-10 w-full" />
              <SkeletonBox className="h-10 w-full" />
              <SkeletonBox className="h-10 w-full" />
            </div>
          </div>

          {/* button */}
          <SkeletonBox className="h-12 w-full" />

          {/* description */}
          <div className="space-y-2">
            <SkeletonBox className="h-4 w-full" />
            <SkeletonBox className="h-4 w-5/6" />
            <SkeletonBox className="h-4 w-4/6 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* RELATED SECTION MOCK */}
      <div className="space-y-4">
        <SkeletonBox className="h-6 w-40 mx-auto" />

        <div className="flex gap-4 overflow-hidden">
          <SkeletonBox className="h-40 w-32" />
          <SkeletonBox className="h-40 w-32" />
          <SkeletonBox className="h-40 w-32 hidden sm:block" />
          <SkeletonBox className="h-40 w-32 hidden md:block" />
        </div>
      </div>
    </div>
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    <SkeletonBox className="h-10 w-full" />
    {[...Array(6)].map((_, i) => (
      <SkeletonBox key={i} className="h-12 w-full" />
    ))}
  </div>
);

const DefaultSkeleton = () => (
  <div className="space-y-3">
    <SkeletonBox className="h-6 w-1/3" />
    <SkeletonBox className="h-4 w-full" />
    <SkeletonBox className="h-4 w-5/6" />
  </div>
);

const CartSkeleton = () => {
  return (

    <>
      <div className="px-8 md:px-8 lg:px-8 pt-10 py-16 mt-8 mb-20">

        {/* HEADER */}
        <div className="relative mb-8 pb-6">
          <div className="flex flex-col items-center text-center">
            <SkeletonBox className="h-8 w-48 mb-3" />
            <SkeletonBox className="h-4 w-72" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-10">

          {/* LEFT SIDE */}
          <div className="flex-1 space-y-6">

            {/* DESKTOP TABLE */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-4 text-left">
                      <SkeletonBox className="h-4 w-24" />
                    </th>
                    <th className="py-4 text-center">
                      <SkeletonBox className="h-4 w-16 mx-auto" />
                    </th>
                    <th className="py-4 text-center">
                      <SkeletonBox className="h-4 w-20 mx-auto" />
                    </th>
                    <th className="py-4 text-right">
                      <SkeletonBox className="h-4 w-16 ml-auto" />
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {[...Array(3)].map((_, i) => (
                    <tr key={i} className="border-b">
                      
                      {/* PRODUCT */}
                      <td className="py-6">
                        <div className="flex gap-4">
                          <SkeletonBox className="w-20 h-24" />
                          <div className="space-y-2 w-full">
                            <SkeletonBox className="h-4 w-3/4" />
                            <SkeletonBox className="h-3 w-1/2" />
                            <SkeletonBox className="h-3 w-1/3" />
                            <SkeletonBox className="h-3 w-20" />
                          </div>
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="text-center py-6">
                        <SkeletonBox className="h-4 w-16 mx-auto" />
                      </td>

                      {/* QTY */}
                      <td className="text-center py-6">
                        <SkeletonBox className="h-8 w-24 mx-auto" />
                      </td>

                      {/* TOTAL */}
                      <td className="text-right py-6">
                        <SkeletonBox className="h-4 w-16 ml-auto" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-4">

                  <div className="flex gap-4">
                    <SkeletonBox className="w-20 h-24" />

                    <div className="space-y-2 flex-1">
                      <SkeletonBox className="h-4 w-3/4" />
                      <SkeletonBox className="h-3 w-1/2" />
                      <SkeletonBox className="h-3 w-1/3" />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <SkeletonBox className="h-4 w-20" />
                    <SkeletonBox className="h-4 w-20" />
                  </div>

                  <SkeletonBox className="h-8 w-full" />
                </div>
              ))}
            </div>

            {/* FOOTER */}
            <div className="mt-8 pt-6 flex flex-col md:flex-row md:justify-between gap-8">

              {/* CONTINUE SHOPPING */}
              <SkeletonBox className="h-5 w-40" />

              {/* SUMMARY BOX */}
              <div className="w-full md:w-[380px] border rounded-sm p-5 space-y-3">
                <SkeletonBox className="h-5 w-full" />
                <SkeletonBox className="h-5 w-2/3" />
                <SkeletonBox className="h-10 w-full mt-4" />
              </div>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        <div className="mt-10">
          <SkeletonBox className="h-6 w-40 mx-auto mb-6" />

          <div className="flex gap-4 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <SkeletonBox key={i} className="h-40 w-[150px]" />
            ))}
          </div>
        </div>

      </div>
    </>
  );
};

export default Loading;