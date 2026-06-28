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
      case "products":
        return <ProductsSkeleton />;
      case "table":
        return <TableSkeleton />;
      case "cart":
        return <CartSkeleton />;
      case "brand":
        return <BrandSkeleton />;
      case "homeProducts":
        return <HomeProductsSkeleton />;
      case "orders":
        return <OrdersSkeleton />;
      case "wishlist":
        return <WishlistSkeleton />;
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
  <div className="flex flex-col bg-white mt-16 text-black dark:bg-white dark:text-black min-h-screen text-black dark:bg-white dark:text-black min-h-screen">
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
        <div className="flex flex-col mt-2 space-y-5">

          {/* title */}
          <SkeletonBox className="h-8 w-full md:w-3/4" />
          <SkeletonBox className="h-8 w-full md:w-3/4" />


          {/* price */}
          <div className="flex gap-3">
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-5 w-20" />
          </div>

          {/* size selector */}
          <div className="space-y-2 mt-8 md:mt-18 mb-6 w-full">
            {/* <SkeletonBox className="h-12 w-full" /> */}
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

const ProductsSkeleton = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col items-start px-4 md:px-8 mt-10 lg:px-8 pt-8">

        {/* HEADER */}
        <div className="w-full flex items-center justify-center border-b pb-6">
          <div className="text-center">
            <SkeletonBox className="h-5 w-28 mx-auto" />
          </div>
        </div>

        {/* FILTER SECTION */}
        <div className="mt-6 w-full bg-white p-4 border rounded-sm space-y-4">
          <div className="flex flex-wrap gap-3">
            <SkeletonBox className="h-10 w-28" />
            <SkeletonBox className="h-10 w-28" />
            <SkeletonBox className="h-10 w-28" />
            <SkeletonBox className="h-10 w-28 hidden md:block" />
          </div>

          <div className="flex justify-between items-center">
            <SkeletonBox className="h-4 w-40" />
            <SkeletonBox className="h-4 w-24" />
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div
          className="
            mt-12 pb-14 w-full grid grid-cols-2
            sm:grid-cols-3 lg:grid-cols-4
            gap-y-4 gap-x-4 sm:gap-6 lg:gap-8
            max-w-7xl
          "
        >
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              {/* image */}
              <SkeletonBox className="w-full aspect-[3/4] rounded-md" />

              {/* brand/title */}
              <SkeletonBox className="h-4 w-3/4" />

              {/* description */}
              <SkeletonBox className="h-3 w-1/2" />

              {/* price */}
              <div className="flex gap-2">
                <SkeletonBox className="h-4 w-16" />
                <SkeletonBox className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="w-full flex justify-center mt-12 mb-16">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white shadow border">
            <SkeletonBox className="h-8 w-16" />
            <SkeletonBox className="h-8 w-8" />
            <SkeletonBox className="h-8 w-8" />
            <SkeletonBox className="h-8 w-8" />
            <SkeletonBox className="h-8 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

const BrandSkeleton = () => {
  return (
    <div className="flex flex-col mt-24 items-center w-full">
      {/* TOP HEADER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex justify-center">
        <div className="text-center">
          <SkeletonBox className="h-5 w-72 md:w-96 mx-auto" />
          <SkeletonBox className="h-4 w-52 md:w-64 mx-auto mt-3" />
        </div>
      </div>

      {/* TITLE */}
      <div className="mt-20 w-full max-w-6xl">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex justify-center">
          <SkeletonBox className="h-6 w-32" />
        </div>

        {/* BRAND GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 px-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden shadow-lg bg-white"
            >
              {/* Image */}
              <SkeletonBox className="w-full h-[420px] md:h-[500px] rounded-none" />

              {/* Overlay brand text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <SkeletonBox className="h-10 w-40 bg-white/30 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const HomeProductsSkeleton = () => {
  return (
    <div className="flex flex-col items-center mt-24 mb-24 px-4 w-full">
      {/* HEADER */}
      <div className="text-center">
        <SkeletonBox className="h-5 w-52 mx-auto" />
        <SkeletonBox className="h-4 w-64 mx-auto mt-3" />
      </div>

      {/* SECTION TITLE */}
      <div className="mt-8 text-center">
        <SkeletonBox className="h-5 w-48 mx-auto" />
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-4 gap-x-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 md:px-12 lg:px-20 mt-12 w-full max-w-7xl">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            {/* Product image */}
            <SkeletonBox className="w-full aspect-[3/4] rounded-md" />

            {/* Product name */}
            <SkeletonBox className="h-4 w-3/4" />

            {/* Subtitle / brand */}
            <SkeletonBox className="h-3 w-1/2" />

            {/* Price */}
            <div className="flex gap-2">
              <SkeletonBox className="h-4 w-20" />
              <SkeletonBox className="h-4 w-14" />
            </div>
          </div>
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      <SkeletonBox className="h-10 w-36 rounded mt-12" />
    </div>
  );
};

const OrdersSkeleton = () => {
  return (
    <div className="w-full pt-20 px-6 md:px-16 lg:px-32 space-y-8">

      {/* PAGE HEADER */}
      <div className="text-center space-y-2">
        <SkeletonBox className="h-7 w-48 mx-auto" />
        <SkeletonBox className="h-4 w-72 mx-auto" />
      </div>

      {/* ORDER CARDS */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border rounded-sm bg-white overflow-hidden"
          >

            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b">
              <div className="space-y-2">
                <SkeletonBox className="h-3 w-40" />
                <SkeletonBox className="h-3 w-56" />
              </div>

              <div className="flex items-center gap-3">
                <SkeletonBox className="h-6 w-24 rounded-full" />
                <SkeletonBox className="h-6 w-20" />
              </div>
            </div>

            {/* PRODUCT STRIP */}
            <div className="p-5">
              <div className="flex gap-3 overflow-hidden">
                {[...Array(4)].map((_, j) => (
                  <SkeletonBox
                    key={j}
                    className="w-16 h-16 rounded-lg"
                  />
                ))}

                <SkeletonBox className="w-16 h-16 rounded-lg" />
              </div>

              <SkeletonBox className="h-4 w-40 mt-4" />
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 pb-5">
              <div className="space-y-2">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-3/4" />
              </div>

              <div className="space-y-2">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-2/3" />
              </div>

              <div className="space-y-2">
                <SkeletonBox className="h-4 w-24" />
                <SkeletonBox className="h-3 w-full" />
                <SkeletonBox className="h-3 w-1/2" />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 px-5 pb-5 pt-3 border-t bg-gray-50">
              <SkeletonBox className="h-9 w-40" />
              <SkeletonBox className="h-9 w-32" />
              <SkeletonBox className="h-9 w-36" />
            </div>

          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-2 pt-4">
        <SkeletonBox className="h-9 w-20" />
        <SkeletonBox className="h-9 w-9" />
        <SkeletonBox className="h-9 w-9" />
        <SkeletonBox className="h-9 w-9" />
        <SkeletonBox className="h-9 w-20" />
      </div>

    </div>
  );
};

const DefaultSkeleton = () => (
  <div className="space-y-3">
    <SkeletonBox className="h-6 w-1/3" />
    <SkeletonBox className="h-4 w-full" />
    <SkeletonBox className="h-4 w-5/6" />
  </div>
);

const WishlistSkeleton = () => {
  return (
    <div className="min-h-screen mt-8 px-4 md:px-10 py-10 w-full">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto mb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-zinc-200 mb-5">
          <SkeletonBox className="h-4 w-4 rounded-full" />
          <SkeletonBox className="h-3 w-24" />
        </div>

        <SkeletonBox className="h-10 w-44 mx-auto" />
        <SkeletonBox className="h-4 w-72 mx-auto mt-4" />
      </div>

      {/* Cards Skeleton */}
      <div
        className="grid gap-7 w-full"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        }}
      >
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="rounded-sm bg-white border border-zinc-200 overflow-hidden shadow-sm"
          >
            {/* Image */}
            <SkeletonBox className="h-[380px] w-full rounded-none" />

            {/* Content */}
            <div className="p-5 space-y-3">
              <SkeletonBox className="h-3 w-20" />
              <SkeletonBox className="h-5 w-full" />
              <SkeletonBox className="h-5 w-3/4" />
              <SkeletonBox className="h-5 w-24 mt-3" />
            </div>

            {/* Button */}
            <div className="border-t border-zinc-100 px-5 py-4">
              <SkeletonBox className="h-11 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;