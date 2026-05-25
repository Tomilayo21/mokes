"use client"

import { IoIosArrowRoundForward } from "react-icons/io";

export default function AnnouncementBar() {
  return (
        <div className="w-full bg-zinc-900 text-white text-xs md:text-sm py-2 flex justify-center tracking-wide">
            <button className="group flex items-center gap-2 uppercase">
                Free Shipping on Orders Over ₦50,000
                <IoIosArrowRoundForward className="w-6 h-6 text-gray-300 transition-all duration-300 group-hover:translate-x-1" />
                Shop now
            </button>
        </div>
  );
}