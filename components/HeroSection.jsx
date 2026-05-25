"use client";

import { useState } from "react";
import { ShoppingCart, Menu, Handbag } from "lucide-react";
import { LiaShoppingBagSolid } from "react-icons/lia";
import { PiBagThin } from "react-icons/pi";
import { TfiSearch } from "react-icons/tfi";
import { IoIosArrowRoundForward } from "react-icons/io";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#f5f5f5]">
        
        {/* Background Image */}
        <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
            backgroundImage:
                "url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600&auto=format&fit=crop')",
            }}
        >
            <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex justify-center">
            <div className="max-w-2xl text-white text-center">
                
                {/* Small Tag */}
                <p className="uppercase tracking-[0.3em] text-sm mb-4 text-gray-200">
                New Collection 2026
                </p>

                {/* Heading */}
                <h1 className="text-2xl uppercase md:text-4xl font-light tracking-widest leading-tight mb-6">
                Elevate Your Everyday Style
                </h1>

                {/* Description */}
                <p className="text-base md:text-lg text-gray-200 tracking-wide leading-relaxed mb-8 max-w-lg mx-auto">
                Modern essentials designed for comfort, confidence, and timeless style.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="group flex items-center cursor-pointer uppercase gap-2">
                    <IoIosArrowRoundForward className="w-6 h-6 text-gray-300 origin-left transition-all duration-300 group-hover:scale-x-125 group-hover:translate-x-1" />
                    Explore Collections
                </button>
                </div>

            </div>
        </div>

    </section>
  )
}
