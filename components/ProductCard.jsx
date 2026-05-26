"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { Heart, Star, XCircle, ShoppingCart, AlertTriangle } from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

const ProductCard = ({ product }) => {
  if (product.visible === false) return null;

  const router = useRouter();
  const { currency, addToCart } = useAppContext();

  const { data: session } = useSession(); 
  const user = session?.user;

  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pressTimer = useRef(null);


  // ------------------ Long Press Modal ------------------
  const handleLongPressStart = () => {
    pressTimer.current = setTimeout(() => setShowModal(true), 500);
  };
  const handleLongPressEnd = () => {
    clearTimeout(pressTimer.current);
    setShowModal(false);
  };


  // ------------------ Fetch Favorites ------------------
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user?.id) return; // ✅ use NextAuth user
      try {
        const res = await fetch(`/api/favorites?userId=${user.id}`);
        if (!res.ok) return;
        const data = await res.json();
        const found = data.find((f) => f.productId._id === product._id);
        setIsFavorite(!!found);
      } catch (err) {
        console.error("Favorite fetch failed:", err);
      }
    };
    checkFavorite();
  }, [user?.id, product._id]);

  // ------------------ Toggle Favorite ------------------
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
              Please login to add items as favorite
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
      const res = await fetch("/api/favorites", {
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
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-2 p-4`}
            >
              {isFavorite ? (
                <XCircle className="text-red-500" size={20} />
              ) : (
                <Heart className="text-orange-500 fill-orange-500" size={20} />
              )}
              <p className="text-sm font-normal text-black dark:text-white">
                {!isFavorite ? "Added to favorites" : "Removed from favorites"}
              </p>
            </div>
          ),
          { duration: 2000 }
        );
      } else {
        toast.error("Failed to update favorites");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Navigation ------------------
  const handleCardClick = () => {
    router.push(`/collection/${product.slug}`);
    scrollTo(0, 0);
  };

  // ------------------ Add to Cart ------------------
  const handleAddToCart = () => {
    if (loading) return;
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
              Please login to add items to your cart
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
    addToCart(product);
  };

  return (
    <div className="w-full">
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
        {/* === Image Section === */}
        <div className="relative h-[420px] md:h-[500px] w-full bg-gray-50 dark:bg-gray-50 flex items-center justify-center overflow-hidden">
          <Image
            src={product.image[0]}
            alt={product.name}
            width={400}
            height={400}
            className="w-[80%] h-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 bg-white/90 dark:bg-white/90 p-2 rounded-full border border-black hover:scale-110 transition"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={16}
              className={isFavorite ? "text-orange-500 fill-orange-500" : "text-gray-500"}
            />
          </button>
        </div>
      </div>

        {/* === Details Section === */}
        <div className="mt-5 flex flex-col gap-2 px-1 pb-4 text-gray-900 dark:text-white w-full">

        <h3 className="text-lg md:text-xl font-medium uppercase text-gray-800 tracking-wide">
            {product.name}
        </h3>

        <p className="text-base text-gray-600">
            {currency}
            {Number(product.offerPrice).toLocaleString()}
        </p>

        {product.stock <= 10 && product.stock > 0 && (
            <p className="text-sm text-gray-500 mt-2">
            Only {product.stock} left!
            </p>
        )}

        {/* ✅ CENTER BUTTON WRAPPER */}
        {/* <div className="flex justify-center w-full mt-4">
            <button
            onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
            }}
            disabled={product.stock === 0}
            className={`w-full py-3 py-4 border flex items-center justify-center text-sm transition-colors
                ${
                product.stock === 0
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "hover:bg-gray-50 text-black"
                }`}
            >
            {product.stock === 0 ? "Sold Out" : "Add to Cart"}
            </button>
        </div> */}

        </div>
    </div>

  );
};

export default ProductCard;
