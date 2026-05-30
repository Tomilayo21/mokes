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
  
  const { currency, addToCart } = useAppContext();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [likes, setLikes] = useState(product.likes || []);
  const [loading, setLoading] = useState(false);
  const liked = user && likes.includes(user.id);

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

  // ------------------ Toggle Favorite ------------------
  const toggleFavorite = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Please log in first.");
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


  const { data: reviews = [] } = useSWR(
    `/api/reviews?productId=${product._id}`,
    fetcher
  );

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const handleCardClick = () => {
    router.push(`/collection/${product.slug}`);
    scrollTo(0, 0);
  };

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please log in to add items to your cart.");
      router.push("/authentication");
      return;
    }
    addToCart(product);
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
