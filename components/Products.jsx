"use client";

import { useEffect } from "react";
import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";

// Dummy products
const dummyProducts = [
  {
    _id: "1",
    name: "Classic White Tee",
    image: ["/anomaly-WWesmHEgXDs-unsplash.jpg"],
    offerPrice: 29,
    stock: 12,
  },
  {
    _id: "2",
    name: "Oversized Hoodie",
    image: ["/redicul-pict-ggcJKGpx3pI-unsplash.jpg"],
    offerPrice: 59,
    stock: 5,
  },
  {
    _id: "3",
    name: "Minimal Jacket",
    image: ["/lea-ochel-nsRBbE6-YLs-unsplash.jpg"],
    offerPrice: 89,
    stock: 0,
  },
  {
    _id: "4",
    name: "Relaxed Street Pants",
    image: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80",
    ],
    offerPrice: 45,
    stock: 8,
  },
];

const Products = () => {
  const currency = "₦";

  const avgRating = 4.5;

  return (
    <div className="flex flex-col items-center mt-24 mb-24 px-4">

      {/* HEADER */}
      <div className="text-center">
        <p className="text-sm md:text-lg text-black uppercase tracking-[0.25em]">
          everyone's obsessed
        </p>

        <p className="text-xs md:text-sm text-zinc-500 mt-2">
          Better-for-you styles you'll love, too
        </p>
      </div>

      {/* SECTION TITLE */}
      <div className="mt-8 text-center">
        <p className="text-sm md:text-lg text-black uppercase tracking-widest">
          shop cult's favorites
        </p>
      </div>

      {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 mt-12 w-full max-w-7xl">

        {dummyProducts.map((product) => (
            <div
            key={product._id}
            className="group flex flex-col w-full cursor-pointer 
            bg-white overflow-hidden transition duration-300 hover:scale-[1.01]"
            >

            {/* IMAGE */}
            <div className="relative h-[420px] md:h-[520px] w-full bg-gray-100 flex items-center justify-center overflow-hidden">

                <img
                src={product.image[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Favorite */}
                <button className="absolute top-5 right-5 bg-white/90 p-3 rounded-full">
                <Heart size={18} className="text-gray-500" />
                </button>

            </div>

            {/* DETAILS */}
            <div className="mt-5 flex flex-col gap-2 px-1 pb-4">

                {/* Name */}
                <h3 className="text-lg md:text-xl font-medium uppercase text-gray-800 tracking-wide">
                {product.name}
                </h3>

                {/* Price */}
                <p className="text-base text-gray-600">
                {currency}{product.offerPrice}
                </p>

                {/* Stock */}
                {product.stock <= 10 && product.stock > 0 && (
                <p className="text-sm text-gray-500">
                    Only {product.stock} left
                </p>
                )}

                {/* Sold Out */}
                {product.stock === 0 && (
                <p className="text-sm text-red-500">
                    Sold Out
                </p>
                )}

                {/* Button */}
                <button
                disabled={product.stock === 0}
                className={`mt-4 px-4 py-3 text-sm flex items-center justify-center gap-2 border transition
                ${
                    product.stock === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "hover:bg-gray-50 text-black"
                }`}
                >
                {/* <ShoppingCart size={16} /> */}
                Add to Cart
                </button>

            </div>
            </div>
        ))}

        </div>
    </div>
  );
};

export default Products;