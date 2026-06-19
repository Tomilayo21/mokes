"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Heart, Star, XCircle, ShoppingCart, Tag, Package } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductCard = ({ product }) => {
  const { data: session } = useSession(); 
  const user = session?.user;
  if (product.visible === false) return null;
  const currency = "₦";
  const router = useRouter();
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
    const fromCollection = pathname.startsWith("/collections/")
      ? pathname.split("/products")[0] // clean base collection
      : null;

    let targetRoute;

    if (pathname.startsWith("/collections/")) {
      const base = pathname.split("/products")[0];
      targetRoute = `${base}/products/${product.slug}`;
    } else {
      targetRoute = `/collections/all/products/${product.slug}`;
    }

    if (fromCollection) {
      targetRoute += `?from=${encodeURIComponent(fromCollection)}`;
    }

    router.push(targetRoute);
    scrollTo(0, 0);
  };



  return (
    <div
      onClick={handleCardClick}
      onMouseDown={handleLongPressStart}
      onTouchStart={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchEnd={handleLongPressEnd}
      className="group flex flex-col max-w-none w-full cursor-pointer
            bg-gray-50 dark:bg-gray-50
            transition-all  hover:scale-[1.02] overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-[200px] md:h-[280px] w-full bg-gray-50 dark:bg-gray-50 flex items-center justify-center overflow-hidden">
        <Image
          src={product.image?.[0] || "/placeholder.jpg"} // fallback image
          alt={product.name || "Product"}
          width={250}
          height={250}
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="p-2 flex flex-col flex-1 text-gray-900 dark:text-gray-900">
        <h3 className="text-xs font-normal truncate flex items-center gap-1 uppercase text-gray-800 tracking-wide">
          {product.name}
        </h3>

        {/* Price & Rating */}
        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm font-light text-gray-600">
            {currency}
            {Number(product.offerPrice).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
