"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Menu, Handbag } from "lucide-react";
import { HiMenuAlt3 } from "react-icons/hi"
import { TfiClose } from "react-icons/tfi";
import { SlBag } from "react-icons/sl";
import { IoSearch } from "react-icons/io5";
import { FaRegUser } from "react-icons/fa6";
import { IoIosArrowForward, IoIosArrowRoundForward } from "react-icons/io";
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation";
import AvatarMenu from "./AvatarMenu";
import Link from "next/link";


export default function Navbar() {
  const { data: session, status } = useSession(); 
  const user = session?.user
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openCollections, setOpenCollections] = useState(false);
  const [activeMenu, setActiveMenu] = useState("main"); 
  const [genderTab, setGenderTab] = useState("men");
  const [mounted, setMounted] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  useEffect(() => setMounted(true), []);


  const handleEsc = useCallback(
    (e) => {
        if (e.key === "Escape") setShowSignup(false);
    },
    [setShowSignup]
  );

  useEffect(() => {
    if (showSignup) window.addEventListener("keydown", handleEsc);
    else window.removeEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [showSignup, handleEsc]);

  return (
    <header className="w-full border-b bg-white backdrop-blur-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16">

            {/* Mobile Layout */}
            <div className="grid grid-cols-3 items-center h-full md:hidden">

            {/* Left - Menu */}
            <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="relative w-8 h-8 flex items-center justify-center"
            >
            {/* Menu Icon */}
            <HiMenuAlt3
                className={`absolute text-2xl text-black transition-all duration-300 ease-in-out
                ${
                    menuOpen
                    ? "opacity-0 rotate-90 scale-75"
                    : "opacity-100 rotate-0 scale-100"
                }`}
            />

            {/* Close Icon */}
            <TfiClose
                className={`absolute text-2xl text-black transition-all duration-300 ease-in-out
                ${
                    menuOpen
                    ? "opacity-100 rotate-0 scale-100"
                    : "opacity-0 -rotate-90 scale-75"
                }`}
            />
            </button>

            {/* Center - Logo */}
            <div className="flex justify-center group cursor-pointer">
            <Link href="/" className="text-xl font-light tracking-tight uppercase">
                <span className="text-[var(--sage)] tracking-[0.35em] hover:text-zinc-700 transition">
                    MOKÉS
                </span>
            </Link>
            </div>

            {/* Right - Cart */}
                <div className="flex justify-end gap-2 items-center">
                    <IoSearch className="w-4 h-4 text-sm hover:text-black/60 text-black transition"
                    />
                    {mounted &&
                        (user ? (
                            <>
                                <AvatarMenu/>
                                {/* <p>Hi</p> */}
                            </>
                        ) :(
                            <button
                                onClick={() => router.push("/authentication")}
                                className="flex items-center gap-2 hover:text-gray-50 transition"
                            >
                                <FaRegUser className="w-4 h-4 hover:text-black/60 text-black transition"/>   
                            </button>
                        ))
                    }
                    <SlBag className="w-4 h-4 relative text-sm hover:text-black text-black transition"
                    />
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex items-center justify-between h-full">

            {/* Logo */}
            <Link href="/" className="text-xl font-light tracking-tight uppercase">
                <span className="text-[var(--sage)] tracking-[0.35em] group-hover:text-zinc-700 transition">
                MOKÉS
                </span>
            </Link>

            {/* Desktop Links */}
            <nav className="flex items-center gap-8 text-sm font-normal tracking-widest font-medium uppercase">
                <a href="#" className="hover:text-black transition text-black">
                Shop
                </a>
                <a href="#" className="hover:text-black transition text-black">
                New Arrivals
                </a>
                <a href="#" className="hover:text-black transition text-black">
                Collections
                </a>
                {/* <a href="#" className="hover:text-black transition text-black">
                Contact
                </a> */}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
                <IoSearch className="w-4 h-4 hover:text-black/60 text-black transition"
                />
                {mounted &&
                    (user ? (
                        <>
                            <AvatarMenu/>
                            {/* <p>Hi</p> */}
                        </>
                    ) :(
                        <button
                            onClick={() => router.push("/authentication")}
                            className="flex items-center gap-2 hover:text-gray-50 transition"
                        >
                            <FaRegUser className="w-4 h-4 hover:text-black/60 text-black transition"/>   
                        </button>
                    ))
                }
                {/* <FaRegUser className="w-4 h-4 hover:text-black/60 text-black transition"/> */}
                <SlBag className="w-4 h-4 text-black hover:text-black/60 transition"

                />
            </div>
            </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
                <div className="md:hidden fixed top-16 left-0 w-full h-[calc(100vh-4rem)] z-50 pointer-events-none">
                    
                    {/* BACKDROP */}
                    <div
                        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                            menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
                        }`}
                        onClick={() => setMenuOpen(false)}
                    />

                    {/* DRAWER */}
                    <div
                        className={`absolute top-0 left-0 w-[85%] h-full bg-white overflow-y-auto px-4 py-6 text-sm text-black uppercase flex flex-col
                        transform transition-transform duration-300 ease-in-out
                        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
                        pointer-events-auto`}
                    >

                    {/* TOP TABS */}
                    <div className="flex items-center gap-8 border-b border-zinc-200 pb-4 mb-6">

                    <button
                        onClick={() => setGenderTab("men")}
                        className={`pb-2 transition uppercase ${
                        genderTab === "men"
                            ? "border-b border-black text-black"
                            : "text-zinc-400"
                        }`}
                    >
                        Men
                    </button>

                    <button
                        onClick={() => setGenderTab("women")}
                        className={`pb-2 transition uppercase ${
                        genderTab === "women"
                            ? "border-b border-black text-black"
                            : "text-zinc-400"
                        }`}
                    >
                        Women
                    </button>

                    </div>

                    {/* ================= MEN MENU ================= */}
                    {genderTab === "men" && (
                        <>
                            {/* MAIN MENU */}
                            {activeMenu === "main" && (
                            <div className="space-y-6">

                                <a href="#" className="flex justify-between items-center">
                                <span>Home</span>
                                </a>

                                <a href="#" className="flex justify-between items-center">
                                <span>Shop</span>
                                </a>

                                <a href="#" className="flex justify-between items-center">
                                <span>New Arrivals</span>
                                </a>

                                {/* COLLECTIONS */}
                                <button
                                    onClick={() => setActiveMenu("collections")}
                                    className="flex justify-between items-center w-full"
                                    >
                                    <span className="text-black tracking-wide uppercase">
                                        COLLECTIONS
                                    </span>

                                    <IoIosArrowForward className="text-zinc-500" />
                                </button>

                                <button
                                    onClick={() => setActiveMenu("mentees")}
                                    className="flex justify-between items-center w-full"
                                    >
                                    <span className="text-black tracking-wide uppercase">
                                        tees
                                    </span>

                                    <IoIosArrowForward className="text-zinc-500" />
                                </button>

                                <button
                                    onClick={() => setActiveMenu("shirts")}
                                    className="flex justify-between items-center w-full"
                                    >
                                    <span className="text-black tracking-wide uppercase">
                                        shirts
                                    </span>

                                    <IoIosArrowForward className="text-zinc-500" />
                                </button>

                                <a href="#" className="flex justify-between items-center">
                                <span>Pants</span>
                                </a>

                                <a href="#" className="flex justify-between items-center">
                                <span>Contact</span>
                                </a>

                            </div>
                            )}

                            {/* MEN COLLECTIONS */}
                            {activeMenu === "collections" && (
                                <div className="space-y-8">

                                    {/* HEADER */}
                                    <div className="relative flex items-center justify-center">

                                    <button
                                        onClick={() => setActiveMenu("main")}
                                        className="absolute left-0"
                                    >
                                        <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                    </button>

                                    <h2 className="tracking-[0.2em]">
                                        Men's Collections
                                    </h2>

                                    </div>

                                    {/* LINKS */}
                                    <div className="space-y-6">

                                    <div className="border-b border-zinc-100 pb-4">
                                        <span className="font-semibold tracking-wide">
                                        Collections
                                        </span>
                                    </div>

                                    <a href="#" className="block">
                                        Streetwear
                                    </a>

                                    <a href="#" className="block">
                                        Essentials
                                    </a>

                                    <a href="#" className="block">
                                        Accessories
                                    </a>

                                    </div>

                                </div>
                            )}
                            {activeMenu === "mentees" && (
                                <div className="space-y-8">

                                    {/* HEADER */}
                                    <div className="relative flex items-center justify-center">

                                    <button
                                        onClick={() => setActiveMenu("main")}
                                        className="absolute left-0"
                                    >
                                        <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                    </button>

                                    <h2 className="tracking-[0.2em]">
                                        Men's Tees
                                    </h2>

                                    </div>

                                    {/* LINKS */}
                                    <div className="space-y-6">

                                    <div className="border-b border-zinc-100 pb-4">
                                        <span className="font-semibold tracking-wide">
                                        tees
                                        </span>
                                    </div>

                                    <a href="#" className="block">
                                        all tees
                                    </a>

                                    <a href="#" className="block">
                                        shop tee bundles
                                    </a>

                                    <a href="#" className="block">
                                        tees & tanks
                                    </a>

                                    <a href="#" className="block">
                                        polos
                                    </a>
                                    </div>

                                </div>
                            )}
                            {activeMenu === "shirts" && (
                                <div className="space-y-8">

                                    {/* HEADER */}
                                    <div className="relative flex items-center justify-center">

                                    <button
                                        onClick={() => setActiveMenu("main")}
                                        className="absolute left-0"
                                    >
                                        <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                    </button>

                                    <h2 className="tracking-[0.2em]">
                                        Men's Shirts
                                    </h2>

                                    </div>

                                    {/* LINKS */}
                                    <div className="space-y-6">

                                    <div className="border-b border-zinc-100 pb-4">
                                        <span className="font-semibold tracking-wide">
                                        shirts
                                        </span>
                                    </div>

                                    <a href="#" className="block">
                                        All Shirts
                                    </a>

                                    <a href="#" className="block">
                                        shirt bundles
                                    </a>

                                    <a href="#" className="block">
                                        long sleeves
                                    </a>

                                    <a href="#" className="block">
                                        short sleeve
                                    </a>
                                    <a href="#" className="block">
                                        shirt jackets
                                    </a>
                                    <a href="#" className="block">
                                        linens shirts
                                    </a>
                                    <a href="#" className="block">
                                        polos
                                    </a>
                                    </div>

                                </div>
                            )}
                        </>
                    )}

                    {/* ================= WOMEN MENU ================= */}
                    {genderTab === "women" && (
                        <>
                            {/* MAIN MENU */}
                            {activeMenu === "main" && (
                            <div className="space-y-6">

                                <a href="#" className="flex justify-between items-center">
                                <span>Home</span>
                                </a>

                                <a href="#" className="flex justify-between items-center">
                                <span>Shop</span>
                                </a>

                                <a href="#" className="flex justify-between items-center">
                                <span>New Arrivals</span>
                                </a>

                                {/* COLLECTIONS */}
                                <button
                                onClick={() => setActiveMenu("collections")}
                                className="flex justify-between items-center w-full"
                                >
                                <span className="text-black tracking-wide uppercase">Collections</span>
                                <IoIosArrowForward className="text-zinc-500" />
                                </button>

                                <button
                                onClick={() => setActiveMenu("linen")}
                                className="flex justify-between items-center w-full"
                                >
                                <span className="text-black tracking-wide uppercase">linen</span>
                                <IoIosArrowForward className="text-zinc-500" />
                                </button>

                                <button
                                onClick={() => setActiveMenu("womentees")}
                                className="flex justify-between items-center w-full"
                                >
                                <span className="text-black tracking-wide uppercase">tees</span>
                                <IoIosArrowForward className="text-zinc-500" />
                                </button>


                                <a href="#" className="flex justify-between items-center">
                                <span>Contact</span>
                                </a>

                            </div>
                            )}

                            {/* WOMEN COLLECTIONS */}
                            {activeMenu === "collections" && (
                                <div className="space-y-8">

                                    {/* HEADER */}
                                    <div className="relative flex items-center justify-center">

                                    <button
                                        onClick={() => setActiveMenu("main")}
                                        className="absolute left-0"
                                    >
                                        <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                    </button>

                                    <h2 className="tracking-[0.2em]">
                                        Women's Collections
                                    </h2>

                                    </div>

                                    {/* LINKS */}
                                    <div className="space-y-6">

                                    <div className="border-b border-zinc-100 pb-4">
                                        <span className="font-semibold tracking-wide">
                                        Collections
                                        </span>
                                    </div>

                                    <a href="#" className="block">
                                        Dresses
                                    </a>

                                    <a href="#" className="block">
                                        Luxury Basics
                                    </a>

                                    <a href="#" className="block">
                                        Bags
                                    </a>

                                    </div>

                                </div>
                            )}

                            {/* WOMEN LINENS */}
                            {activeMenu === "linen" && (
                                <div className="space-y-8">

                                    {/* HEADER */}
                                    <div className="relative flex items-center justify-center">

                                    <button
                                        onClick={() => setActiveMenu("main")}
                                        className="absolute left-0"
                                    >
                                        <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                    </button>

                                    <h2 className="tracking-[0.2em]">
                                        Women's Linen
                                    </h2>

                                    </div>

                                    {/* LINKS */}
                                    <div className="space-y-6">

                                    <div className="border-b border-zinc-100 pb-4">
                                        <span className="font-semibold tracking-wide">
                                        LINEN
                                        </span>
                                    </div>

                                    <a href="#" className="block">
                                        All linen
                                    </a>

                                    <a href="#" className="block">
                                        tops
                                    </a>

                                    <a href="#" className="block">
                                        dresses
                                    </a>

                                    <a href="#" className="block">
                                        bottoms
                                    </a>

                                    <a href="#" className="block">
                                        outerwear
                                    </a>

                                    </div>

                                </div>
                            )}

                            {activeMenu === "womentees" && (
                                <div className="space-y-8">

                                    {/* HEADER */}
                                    <div className="relative flex items-center justify-center">

                                    <button
                                        onClick={() => setActiveMenu("main")}
                                        className="absolute left-0"
                                    >
                                        <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                    </button>

                                    <h2 className="tracking-[0.2em]">
                                        women's tees
                                    </h2>

                                    </div>

                                    {/* LINKS */}
                                    <div className="space-y-6">

                                    <div className="border-b border-zinc-100 pb-4">
                                        <span className="font-semibold tracking-wide">
                                        tees
                                        </span>
                                    </div>

                                    <a href="#" className="block">
                                        All tees
                                    </a>

                                    <a href="#" className="block">
                                        tee bundles
                                    </a>

                                    <a href="#" className="block">
                                        tees & tanks
                                    </a>

                                    <a href="#" className="block">
                                        sweatshirts
                                    </a>

                                    <a href="#" className="block">
                                        bodysuits
                                    </a>

                                    <a href="#" className="block">
                                        tops
                                    </a>

                                    <a href="#" className="block">
                                        tanks
                                    </a>

                                    </div>

                                </div>
                            )}
                        </>
                    )}
                    {/* AUTH SECTION */}
                    {/* <div className="mt-auto border-t border-zinc-200 pt-6 mt-8 space-y-3">

                        <button className="w-full py-3 border text-sm font-medium">
                            Sign In
                        </button>

                        <button className="w-full py-3 bg-black text-white text-sm font-medium">
                            Sign Up
                        </button>

                    </div> */}
                </div>
            </div>
        )}
    </header>
  );
}