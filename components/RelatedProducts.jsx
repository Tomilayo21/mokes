"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Heart, Star, XCircle, ShoppingCart, Tag, Package } from "lucide-react";
import { useSession } from "next-auth/react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductCard = ({ product }) => {
  const { data: session } = useSession(); 
  const user = session?.user;
  if (product.visible === false) return null;
  const currency = "₦";
  const router = useRouter();
  const pathname = usePathname();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pressTimer = useRef(null);

  // Long press
  const handleLongPressStart = () => {
    pressTimer.current = setTimeout(() => setShowModal(true), 500);
  };
  const handleLongPressEnd = () => {
    clearTimeout(pressTimer.current);
    setShowModal(false);
  };


  // Fetch favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user) return;

      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) return;
        const data = await res.json();
        const found = data.find((f) => f.productId._id === product._id);
        setIsFavorite(!!found);
      } catch (err) {
        console.error("Favorite fetch failed:", err);
      }
    };
    checkFavorite();
  }, [user, product._id]);

  // Toggle favorites
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center gap-3 p-4 transform transition-all duration-300 border-l-4 border-red-500 ${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <AlertTriangle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Please login to add items to wishlist
            </p>
          </div>
        ),
        {
          duration: 2500,
          position: "top-right",
        }
      );
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          userId: user.id,
        }),
      });

      if (res.ok) {
        setIsFavorite(!isFavorite);

        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "animate-enter" : "animate-leave"
              } max-w-md w-full bg-gray-50 dark:bg-gray-50 shadow-sm rounded-sm pointer-events-auto flex items-center gap-2 p-4`}
            >
              <p className="text-sm font-light tracking-wide text-gray-800 dark:text-gray-800">
                {!isFavorite ? "Added to wishlist" : "Removed from wishlist"}
              </p>
            </div>
          ),
          { duration: 2000 }
        );
      } else {
        toast.error("Failed to update wishlist");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    let targetRoute;

    const collectionPath = pathname.split("/products")[0];
    const isCollectionsRoute = pathname.startsWith("/collections/");
    const isAllCollection =
      collectionPath === "/collections/all" ||
      pathname === "/collections/all";

    if (isCollectionsRoute && !isAllCollection) {
      targetRoute =
        `${collectionPath}/products/${product.slug}` +
        `?from=${encodeURIComponent(collectionPath)}`;
    } else {
      targetRoute = `/collection/${product.slug}`;
    }

    router.push(targetRoute);
    scrollTo(0, 0);
  };

  return (
    <div className="w-full group cursor-pointer overflow-hidden rounded-sm bg-white border border-zinc-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col h-full">

      {/* IMAGE */}
      <div className="relative w-full aspect-[3/4] bg-zinc-50 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-zinc-50 to-zinc-100 opacity-60" />

        <Image
          src={product.image?.[0] || "/placeholder.jpg"}
          alt={product.name || "Product"}
          width={300}
          height={300}
          className="relative z-10 w-[78%] h-auto object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* DETAILS */}
      <div className="p-5 md:p-6 flex flex-col gap-2 flex-1 justify-between">

        <h3 className="text-sm md:text-base font-medium text-zinc-900 tracking-wide line-clamp-2 leading-snug md:leading-normal min-h-[56px] md:min-h-[52px]">
          {product.name}
        </h3>

        <div className="mt-1 flex flex-col md:flex-row md:items-end md:justify-between">

          <p className="text-lg font-light text-black">
            {currency}
            {Number(product.offerPrice).toLocaleString()}
          </p>

          <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-400 mt-1 md:mt-0">
            Available
          </span>

        </div>

      </div>

    </div>
  );
};

export default ProductCard;
