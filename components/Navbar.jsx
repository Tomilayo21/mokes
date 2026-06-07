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
import { useAppContext } from "@/context/AppContext";
import { HiOutlineShoppingBag } from "react-icons/hi2"
import SearchBar from "./Searchbar";


export default function Navbar() {
  const { data: session, status } = useSession(); 
  const user = status === "authenticated" ? session?.user : null;
  const router = useRouter();
  const { getCartCount } = useAppContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [openCollections, setOpenCollections] = useState(false);
  const [activeMenu, setActiveMenu] = useState("main"); 
  const [genderTab, setGenderTab] = useState("men");
  const [mounted, setMounted] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [mobileStack, setMobileStack] = useState(null);
  
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

    const MENU = {
    shop: {
        label: "Shop",
        href: "/shop",
    },
    newArrivals: {
        label: "New Arrivals",
        href: "/new-arrivals",
    },
    men: {
        label: "Men",
        sections: {
        collections: {
            label: "Collections",
            items: [
            { label: "Streetwear", href: "#" },
            { label: "Essentials", href: "#" },
            { label: "Accessories", href: "#" },
            ],
        },
        tees: {
            label: "Tees",
            items: [
            { label: "All Tees", href: "#" },
            { label: "Bundles", href: "#" },
            { label: "Polos", href: "#" },
            ],
        },
        },
    },
    women: {
        label: "Women",
        sections: {
        collections: {
            label: "Collections",
            items: [
            { label: "Dresses", href: "#" },
            { label: "Luxury Basics", href: "#" },
            { label: "Bags", href: "#" },
            ],
        },
        linen: {
            label: "Linen",
            items: [
            { label: "All Linen", href: "#" },
            { label: "Tops", href: "#" },
            { label: "Dresses", href: "#" },
            ],
        },
        },
    },
    };



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
                    <SearchBar />
                    {mounted &&
                        (user ? (
                            <>
                                <AvatarMenu/>
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
                    <Link href="/cart" className="relative inline-flex">
                        <HiOutlineShoppingBag className="w-4 h-4 text-black hover:text-black/60 transition" />

                        {getCartCount() > 0 && (
                            <span
                            className="
                                absolute -top-2 -right-2
                                min-w-[16px] h-4
                                px-1
                                flex items-center justify-center
                                rounded-full
                                bg-black text-white
                                text-[10px] font-medium
                                leading-none
                            "
                            >
                            {getCartCount()}
                            </span>
                        )}
                    </Link>
                    
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
            <nav className="flex items-center gap-8 text-sm uppercase tracking-widest">
            <Link href={MENU.shop.href} className="hover:text-gray-800 text-black uppercase cursor-pointer">
                {MENU.shop.label}
            </Link>

            <Link href={MENU.newArrivals.href} className="hover:text-gray-800 text-black uppercase cursor-pointer">
                {MENU.newArrivals.label}
            </Link>

            {/* MEN DROPDOWN */}
            <div className="relative group">
                <button className="hover:text-gray-800 text-black uppercase cursor-pointer">{MENU.men.label}</button>

                <div className="absolute left-0 top-full hidden group-hover:block bg-white border shadow-md p-6 w-[300px]">
                {Object.values(MENU.men.sections).map((section) => (
                    <div key={section.label} className="mb-4">
                    <p className="font-normal mb-2 text-gray-700">{section.label}</p>

                    {section.items.map((item) => (
                        <Link key={item.label} href={item.href} className="block py-1 text-sm text-black hover:underline">
                        {item.label}
                        </Link>
                    ))}
                    </div>
                ))}
                </div>
            </div>

            {/* WOMEN DROPDOWN */}
            <div className="relative group">
                <button className="hover:text-gray-800 text-black uppercase cursor-pointer">{MENU.women.label}</button>

                <div className="absolute left-0 top-full hidden group-hover:block bg-white border shadow-md p-6 w-[300px]">
                {Object.values(MENU.women.sections).map((section) => (
                    <div key={section.label} className="mb-4">
                    <p className="font-normal mb-2 text-gray-700">{section.label}</p>

                    {section.items.map((item) => (
                        <Link key={item.label} href={item.href} className="block py-1 text-sm text-black hover:underline">
                        {item.label}
                        </Link>
                    ))}
                    </div>
                ))}
                </div>
            </div>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
                <SearchBar />
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
                <Link href="/cart" className="relative inline-flex">
                    <HiOutlineShoppingBag className="w-4 h-4 text-black hover:text-black/60 transition" />

                    {getCartCount() > 0 && (
                        <span
                        className="
                            absolute -top-2 -right-2
                            min-w-[16px] h-4
                            px-1
                            flex items-center justify-center
                            rounded-full
                            bg-black text-white
                            text-[10px] font-medium
                            leading-none
                        "
                        >
                        {getCartCount()}
                        </span>
                    )}
                </Link>


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
                    className={`absolute top-0 left-0 w-[85%] justify-between h-full bg-white overflow-y-auto px-4 py-6 text-sm text-black uppercase flex flex-col
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
                            {activeMenu === "main" && genderTab === "men" && (
                            <div className="space-y-6">

                                <a href="#" className="flex justify-between items-center">
                                <span>Home</span>
                                </a>

                                <a href={MENU.shop.href} className="flex justify-between items-center">
                                <span>{MENU.shop.label}</span>
                                </a>

                                <a href={MENU.newArrivals.href} className="flex justify-between items-center">
                                <span>{MENU.newArrivals.label}</span>
                                </a>

                                {Object.entries(MENU.men.sections).map(([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveMenu(key)}
                                    className="flex justify-between items-center w-full"
                                >
                                    <span className="text-black tracking-wide uppercase">
                                    {section.label}
                                    </span>

                                    <IoIosArrowForward className="text-zinc-500" />
                                </button>
                                ))}

                                <a href="#" className="flex justify-between items-center">
                                <span>Pants</span>
                                </a>

                            </div>
                            )}

                            {/* MEN COLLECTIONS */}
                            {genderTab === "men" && activeMenu !== "main" && (
                            <div className="space-y-8">

                                {/* HEADER (UNCHANGED UI) */}
                                <div className="relative flex items-center justify-center">

                                <button
                                    onClick={() => setActiveMenu("main")}
                                    className="absolute left-0"
                                >
                                    <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                </button>

                                <h2 className="tracking-[0.2em]">
                                    Men’s {MENU.men.sections[activeMenu]?.label}
                                </h2>

                                </div>

                                {/* LINKS */}
                                <div className="space-y-6">

                                <div className="border-b border-zinc-100 pb-4">
                                    <span className="font-semibold tracking-wide">
                                    {MENU.men.sections[activeMenu]?.label}
                                    </span>
                                </div>

                                {MENU.men.sections[activeMenu]?.items.map((item) => (
                                    <a key={item.label} href={item.href} className="block">
                                    {item.label}
                                    </a>
                                ))}

                                </div>

                            </div>
                            )}
                        </>
                    )}

                    {/* ================= WOMEN MENU ================= */}
                    {genderTab === "women" && (
                        <>
                            {/* MAIN MENU */}
                            {activeMenu === "main" && genderTab === "women" && (
                            <div className="space-y-6">

                                <a href="#" className="flex justify-between items-center">
                                <span>Home</span>
                                </a>

                                <a href={MENU.shop.href} className="flex justify-between items-center">
                                <span>{MENU.shop.label}</span>
                                </a>

                                <a href={MENU.newArrivals.href} className="flex justify-between items-center">
                                <span>{MENU.newArrivals.label}</span>
                                </a>

                                {Object.entries(MENU.women.sections).map(([key, section]) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveMenu(key)}
                                    className="flex justify-between items-center w-full"
                                >
                                    <span className="text-black tracking-wide uppercase">
                                    {section.label}
                                    </span>

                                    <IoIosArrowForward className="text-zinc-500" />
                                </button>
                                ))}


                            </div>
                            )}

                            {/* WOMEN COLLECTIONS */}
                            {genderTab === "women" && activeMenu !== "main" && (
                            <div className="space-y-8">

                                <div className="relative flex items-center justify-center">

                                <button
                                    onClick={() => setActiveMenu("main")}
                                    className="absolute left-0"
                                >
                                    <IoIosArrowRoundForward className="rotate-180 text-xl text-zinc-500" />
                                </button>

                                <h2 className="tracking-[0.2em]">
                                    Women’s {MENU.women.sections[activeMenu]?.label}
                                </h2>

                                </div>

                                <div className="space-y-6">

                                <div className="border-b border-zinc-100 pb-4">
                                    <span className="font-semibold tracking-wide">
                                    {MENU.women.sections[activeMenu]?.label}
                                    </span>
                                </div>

                                {MENU.women.sections[activeMenu]?.items.map((item) => (
                                    <a key={item.label} href={item.href} className="block">
                                    {item.label}
                                    </a>
                                ))}

                                </div>

                            </div>
                            )}
                        </>
                    )}

                    {/* CONTACT (GLOBAL FOOTER LINK) */}
                    <div className="mt-auto border-t border-zinc-200 pt-6">
                    <a
                        href="/contact"
                        className="flex justify-between items-center text-sm uppercase"
                        onClick={() => setMenuOpen(false)}
                    >
                        <span>Contact</span>
                        <IoIosArrowForward className="text-zinc-500" />
                    </a>
                    </div>
                </div>
            </div>
        )}
    </header>
  );
}