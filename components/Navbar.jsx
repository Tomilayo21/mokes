"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { IoChevronDown } from "react-icons/io5";


export default function Navbar() {
  const { data: session, status } = useSession(); 
  const user = status === "authenticated" ? session?.user : null;
  const router = useRouter();
  const { getCartCount } = useAppContext();

  const [menuOpen, setMenuOpen] = useState(false);
  const [genderTab, setGenderTab] = useState("male");
  const tabs = ["male", "female", "brand", "home&gifts"];
  const [mounted, setMounted] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [menuData, setMenuData] = useState({
    male: [],
    female: [],
    brand: [],
    "home&gifts": [],
  });
  const [megaMenu, setMegaMenu] = useState(null);
  
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
  

    const createCollectionSlug = (category, subcategory) => {
    return `${category === "male" ? "males" : "females"}-${subcategory}`;
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
            const res = await fetch("/api/product/list");

            const data = await res.json();

            console.log("API RESPONSE:", data);

            // ✅ FIX
            const products = data.products || [];

            const grouped = products.reduce((acc, product) => {
            const category = product.category?.trim().toLowerCase();
            const subcategory = (product.subCategory || product.subcategory)
                ?.trim()
                .toLowerCase();

            const brand = product.brand?.trim().toLowerCase();

            // handle main categories
            if (category && subcategory) {
                if (!acc[category]) acc[category] = [];
                if (!acc[category].includes(subcategory)) {
                acc[category].push(subcategory);
                }
            }

            // handle brands separately
            if (brand) {
                if (!acc.brand) acc.brand = [];
                if (!acc.brand.includes(brand)) {
                acc.brand.push(brand);
                }
            }

            return acc;
            }, {});

            console.log("GROUPED:", grouped);

            setMenuData({
                male: grouped.male || [],
                female: grouped.female || [],
                brand: grouped.brand || [],
                "home&gifts": grouped["home&gifts"] || [],
            });
            } catch (error) {
            console.log("FETCH ERROR:", error);
            }
        };

        fetchCategories();
    }, []);

    const megaMenuRef = useRef(null);

    useEffect(() => {
    function handleClickOutside(event) {
        if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target)
        ) {
        setMegaMenu(null);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
    }, []);



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
                <div className="relative static" ref={megaMenuRef}>
                    <nav className="flex items-center gap-8 text-sm uppercase tracking-widest">

                        <Link href="/shop" className="hover:text-gray-800 text-black">
                        Shop
                        </Link>

                        <Link href="/new-arrivals" className="hover:text-gray-800 text-black">
                        New Arrivals
                        </Link>

                        {/* TRIGGER ITEMS */}
                        {["male", "female", "brand", "home&gifts"].map((item) => (
                        <button
                            key={item}
                            onClick={() =>
                            setMegaMenu((prev) => (prev === item ? null : item))
                            }
                            className={`flex items-center gap-1 uppercase cursor-pointer transition ${
                            megaMenu === item
                                ? "text-black"
                                : "text-black hover:text-gray-800"
                            }`}
                        >
                            {item}

                            <IoChevronDown
                            className={`transition-transform cursor-pointer duration-300 ${
                                megaMenu === item ? "rotate-180" : ""
                            }`}
                            />
                        </button>
                        ))}
                    </nav>

                    {/* MEGA MENU PANEL */}
                    {megaMenu && (
                        <div className="absolute left-0 top-full w-screen bg-white border-t shadow-lg z-50">
                        <div className="max-w-7xl mx-auto px-10 py-10 grid grid-cols-4 gap-10">

                            {/* MALE */}
                            {megaMenu === "male" && (
                            <div>
                                {menuData.male?.map((item) => (
                                <Link
                                    key={item}
                                    href={`/collections/male-${item}`}
                                    className="block py-1 text-md text-black hover:underline"
                                    onClick={() => setMegaMenu(null)}
                                >
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Link>
                                ))}
                            </div>
                            )}

                            {/* FEMALE */}
                            {megaMenu === "female" && (
                            <div>
                                {menuData.female?.map((item) => (
                                <Link
                                    key={item}
                                    href={`/collections/female-${item}`}
                                    className="block py-1 text-md text-black hover:underline"
                                    onClick={() => setMegaMenu(null)}
                                >
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Link>
                                ))}
                            </div>
                            )}

                            {/* BRANDS */}
                            {megaMenu === "brand" && (
                            <div>
                                {menuData.brand?.map((item) => (
                                <Link
                                    key={item}
                                    href={`/brands/${item}`}
                                    className="block py-1 text-md text-black hover:underline"
                                    onClick={() => setMegaMenu(null)}
                                >
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Link>
                                ))}
                            </div>
                            )}

                            {/* HOME & GIFTS */}
                            {megaMenu === "home&gifts" && (
                            <div>
                                {menuData["home&gifts"]?.map((item) => (
                                <Link
                                    key={item}
                                    href={`/collections/home-and-gifts-${item}`}
                                    className="block py-1 text-md text-black hover:underline"
                                    onClick={() => setMegaMenu(null)}
                                >
                                    {item.charAt(0).toUpperCase() + item.slice(1)}
                                </Link>
                                ))}
                            </div>
                            )}

                        </div>
                        </div>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-4 border-b border-zinc-200 pb-4 mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                        key={tab}
                        onClick={() => setGenderTab(tab)}
                        className={`pb-2 uppercase transition whitespace-nowrap ${
                            genderTab === tab
                            ? "border-b border-black text-black"
                            : "text-zinc-400"
                        }`}
                        >
                        {tab}
                        </button>
                    ))}
                    </div>

                    {/* ================= MEN MENU ================= */}
                    {tabs.map((tab) => (
                        <div key={tab} className="space-y-6">

                            {genderTab === tab && (
                            <>
                                {/* MAIN LINKS */}
                                <div className="space-y-2">

                                    <Link href="/" className="block py-3">
                                        Home
                                    </Link>

                                    <Link href="/shop" className="block py-3">
                                        Shop
                                    </Link>

                                    <Link href="/new-arrivals" className="block py-3">
                                        New Arrivals
                                    </Link>

                                    <Link href="/about" className="block py-3">
                                        About Us
                                    </Link>

                                    {/* CATEGORY LIST (male/female/brand/home&gifts) */}
                                    {(menuData[tab] || []).map((subcategory) => (
                                        <Link
                                        key={subcategory}
                                        href={`/collections/${createCollectionSlug(tab, subcategory)}`}
                                        onClick={() => setMenuOpen(false)}
                                        className="block py-3"
                                        >
                                        {subcategory}
                                        </Link>
                                    ))}

                                    <Link href="/contact" className="block py-3">
                                        Contact us
                                    </Link>
                                
                                </div>
                            </>
                            )}

                        </div>
                    ))}

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