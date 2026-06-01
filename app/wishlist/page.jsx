"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HeartOff, ShoppingCart, Star, Trash2, PackageX, Heart, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

/* -------- Helper: fetch with NextAuth token -------- */
const authFetcher = async (url, token) => {
  if (!token) throw new Error("No token found");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch " + url);
  return res.json();
};

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const currency = "₦";
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /* -------- Redirect if not logged in -------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/authentication");
    }
  }, [status, router]);

  /* -------- Fetch favorites -------- */
    const fetchFavorites = useCallback(async () => {
    try {
        if (status !== "authenticated") return;

        setLoading(true);

        // const res = await fetch("/api/wishlist");
        const res = await fetch("/api/wishlist", {
            credentials: "include",
        });

        // const res = await fetch("/api/wishlist", {
        //     headers: {
        //         Authorization: `Bearer ${session?.accessToken}`,
        //     },
        // });
        const data = await res.json();

        setFavorites(data || []);
    } catch (err) {
        console.error(err);
        setFavorites([]);
    } finally {
        setLoading(false);
    }
    }, [status]);

  useEffect(() => {
    if (status === "authenticated") fetchFavorites();
  }, [status, fetchFavorites]);


  /* -------- Remove favorite -------- */
    const removeFavorite = async (productId) => {
    try {
        // 🔥 instant UI update (no waiting)
        setFavorites((prev) =>
        prev.filter((f) => f.productId?._id !== productId)
        );

        const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
        });

        if (!res.ok) throw new Error();

        toast.success("Updated wishlist");
    } catch (err) {
        toast.error("Failed to update");

        // rollback
        fetchFavorites();
    }
    };


  const toTitleCase = (str = "") => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  /* -------- UI -------- */
  return (
    <>
      <div className="p-4 flex flex-col items-center mt-8 bg-white text-black dark:bg-white dark:text-white min-h-screen px-4 md:px-16">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight flex items-center gap-2">
            Wishlist
          </h1>
          <p className="text-sm text-gray-800 dark:text-gray-800 mt-2">
            Save the products you love and access them anytime.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-gray-500 dark:text-gray-400">Loading wishlist...</p>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-16 text-center">
            <img src="document.png" alt="favorites" className="w-32 h-32 opacity-70 mb-4" />
            <p className="text-lg font-medium text-gray-800 dark:text-gray-800">
              Your favorites list is empty
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-800 mt-1">
              Browse products and tap the heart to save them here.
            </p>
            <button
              onClick={() => router.push("/collections/all")}
              className="mt-6 px-6 py-3 rounded-sm shadow-sm border-t border-zinc-300 
              cursor-pointer bg-[var(--sage)] text-white 
              hover:bg-zinc-500 transition uppercase transition"
            >
              Browse Collections 
            </button>
          </div>
        )}

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          {favorites.map(({ _id, productId }) => {
            const isDeleted = !productId;
            // const rating = productId ? ratingsMap[productId._id] || { avg: 0, count: 0 } : null;

            return (
              <div
                key={_id}
                className="flex flex-col bg-white dark:bg-white transition hover:-translate-y-1 duration-200"
              >
                {/* Product or Deleted placeholder */}
                {isDeleted ? (
                  <div className="block">
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded-t-2xl">
                      <PackageX className="w-12 h-12 text-gray-400" />
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Deleted product
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        This product is no longer available.
                      </p>
                      <p className="text-base font-bold text-gray-400 mt-2">—</p>
                    </div>
                  </div>
                ) : (
                    <Link
                    href={`/collection/${productId.slug}`}
                    className="group flex flex-col w-full bg-gray-50 overflow-hidden transition-all hover:scale-[1.02]"
                    >
                    {/* Image Section */}
                    <div className="relative w-full aspect-[3/4] sm:aspect-[4/5] bg-gray-50 flex items-center justify-center overflow-hidden">
                        <Image
                        src={productId.image?.[0] || "/placeholder.png"}
                        alt={productId.name}
                        width={400}
                        height={400}
                        className="w-[80%] h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* Details Section */}
                    <div className="mt-3 flex flex-col gap-1 px-1 pb-3 text-gray-900 w-full">
                        <h3 className="text-lg md:text-xl font-light text-black tracking-wide">
                        {productId.brand?.toUpperCase()} |{" "}
                        {toTitleCase(productId.name)} |{" "}
                        {toTitleCase(productId.color)}
                        </h3>

                        <p className="text-base text-gray-600">
                        {currency}
                        {Number(productId.offerPrice).toLocaleString()}
                        </p>
                    </div>
                    </Link>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 px-4 py-3 text-sm">
                  <button
                    className="flex items-center gap-1 text-red-500 dark:text-red-400 hover:text-red-600 transition"
                    onClick={() => removeFavorite(productId?._id || _id)}
                  >
                    <Trash2 className="w-4 h-4" />
                    {/* Remove */}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </>
  );
}
