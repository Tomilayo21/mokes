"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Trash2, PackageX } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "swr";


export default function FavoritesPage() {
  const { data: session, status } = useSession();
  // const [products, setProducts] = useState([]);
  const currency = "₦";
  const router = useRouter();

  /* -------- Redirect if not logged in -------- */
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/authentication");
    }
  }, [status, router]);


  const fetcher = (url) =>
    fetch(url, {
      credentials: "include",
      cache: "no-store",
    }).then((res) => res.json());

  const {
    data: favorites = [],
    isLoading,
    mutate,
  } = useSWR(
    status === "authenticated" ? "/api/wishlist" : null,
    fetcher
  );
  
  const isReady = status === "authenticated" && !isLoading;




  /* -------- Remove favorite -------- */
  const removeFavorite = async (productId) => {
    const previousFavorites = favorites;

    try {
      mutate(
        favorites.filter(
          (f) => f.productId?._id !== productId
        ),
        false
      );

      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) throw new Error();

      await mutate();

      toast.success("Updated wishlist");
    } catch (err) {
      mutate(previousFavorites, false);
      toast.error("Failed to update");
    }
  };


  const toTitleCase = (str = "") => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading wishlist...</p>
      </div>
    );
  }
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
        {(status === "loading" || isLoading) && (
          <p className="text-gray-500">
            Loading wishlist...
          </p>
        )}
        {/* Empty State */}
        {isReady && favorites.length === 0 && (
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
