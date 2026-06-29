"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Heart, AlertTriangle } from "lucide-react";


const ProductCard = ({ product, currency }) => {
  if (product.visible === false) return null;
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession(); 
  const user = session?.user;
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const pressTimer = useRef(null);
  const availableSizes = (product.sizes || []).filter(
    (item) => Number(item.stock) > 0
  );

  

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
      if (!user?.id) return;

      try {
        const res = await fetch(`/api/wishlist?userId=${user.id}`);
        if (!res.ok) return;

        const data = await res.json();

        const found = data.find(
          (f) => f.productId && f.productId._id === product._id
        );

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

    // helper toast (reusable inside this function)
    const showToast = (message, type = "success", icon = null) => {
      toast.custom(
        (t) => (
          <div
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
              t.visible
                ? "animate-toast-bounce opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            {/* Optional icon */}
            {icon && <div className="shrink-0">{icon}</div>}

            <p
              className={`flex-1 text-sm font-medium ${
                type === "success" ? "text-zinc-800" : "text-red-800"
              }`}
            >
              {message}
            </p>

            {/* Close */}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 cursor-pointer hover:text-black transition"
            >
              ✕
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
              <div
                className={`h-full ${
                  type === "success" ? "bg-[var(--sage)]" : "bg-red-500"
                }`}
                style={{
                  animation: `toast-progress ${t.duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        ),
        {
          duration: 2500,
          position: "top-right",
        }
      );
    };

    // If not logged in
    if (!user) {
      showToast(
        "Please login to add items to wishlist",
        "error",
        <AlertTriangle className="text-red-500" size={20} />
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

      if (!res.ok) throw new Error();

      const newState = !isFavorite;
      setIsFavorite(newState);

      showToast(
        newState ? "Added to wishlist" : "Removed from wishlist",
        "success"
      );
    } catch (error) {
      showToast("Failed to update wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  // ------------------ Navigation ------------------
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

  const toTitleCase = (str = "") => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
      <div className="w-full group cursor-pointer">
        
        {/* IMAGE WRAPPER */}
        <div
          onClick={handleCardClick}
          onMouseDown={handleLongPressStart}
          onTouchStart={handleLongPressStart}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchEnd={handleLongPressEnd}
          className="relative w-full aspect-[3/4] bg-white overflow-hidden border border-gray-100"
        >
          {/* PRODUCT IMAGE */}
          <Image
            src={product?.image?.[0] || "/placeholder.png"}
            alt={product?.name || "Product"}
            width={500}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />

          {/* soft overlay hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition" />

          {/* Wishlist Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition"
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={16}
              className={
                isFavorite ? "text-[var(--sage)] fill-[var(--sage)]" : "text-gray-500"
              }
            />
          </button>

          {/* STOCK BADGE (optional but premium feel) */}
          {product.stock === 0 && (
            <div className="absolute top-3 left-3 bg-black text-white text-[10px] tracking-widest px-2 py-1 uppercase">
              Sold Out
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="mt-3 px-1 pb-4 space-y-1">

          {/* BRAND + NAME */}
          <h3 className="text-sm md:text-base font-light tracking-wide text-gray-900 leading-snug">
            <span className="uppercase tracking-[0.2em] text-xs text-gray-500">
              {product.brand}
            </span>
          </h3>

          <h3 className="text-sm md:text-base font-light tracking-wide text-gray-900 leading-snug">
            <span className="text-gray-900">
              {toTitleCase(product.name)}
            </span>
          </h3>

          {/* COLOR */}
          <p className="text-xs text-gray-500">
            {toTitleCase(product.color)}
          </p>

          {/* PRICE */}
          <p className="text-sm font-medium text-gray-900 mt-1">
            {currency}
            {Number(product.offerPrice).toLocaleString()}
          </p>

          {/* SIZES */}
          {/* {availableSizes?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {availableSizes.map((item) => (
                <span
                  key={item.size}
                  className="px-2 py-1 text-[11px] border border-gray-200 text-gray-600 rounded-md"
                >
                  {item.size}
                </span>
              ))}
            </div>
          )} */}

          {/* ADD TO CART */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={product.stock === 0}
            className={`
              w-full mt-4 py-3 text-sm tracking-wide border transition
              ${
                product.stock === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white hover:bg-black hover:text-white border-gray-300"
              }
            `}
          >
            {product.stock === 0 ? "Sold Out" : "Add to Bag"}
          </button> */}
        </div>
      </div>

  );
};

export default ProductCard;
