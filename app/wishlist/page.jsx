"use client";
export const dynamic = "force-dynamic";

import { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Footer from "@/components/Footer";
import { Trash2, PackageX, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useSWR from "swr";
import Loading from "@/components/Loading";

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


  const fetcher = async (url) => {
    const res = await fetch(url, {
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch wishlist");
    }

    return res.json();
  };

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

    // helper toast
    const showToast = (message, type = "success") => {
      toast.custom(
        (t) => (
          <div
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
              t.visible
                ? "animate-toast-bounce opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <p
              className={`flex-1 text-sm font-medium ${
                type === "success" ? "text-green-800" : "text-red-800"
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

            {/* Progress Bar */}
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
          duration: 4000,
          position: "top-right",
        }
      );
    };

    try {
      // optimistic update
      mutate(
        favorites.filter((f) => f.productId?._id !== productId),
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

      showToast("Removed from wishlist", "success");
    } catch (err) {
      mutate(previousFavorites, false);
      showToast("Failed to update wishlist", "error");
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
    return <Loading type="wishlist" />;
  }
  /* -------- UI -------- */
  return (
    <>
      <div className="min-h-screen mt-8 px-4 md:px-10 py-10">

        {/* Header */}
        <div className="max-w-7xl mx-auto mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-zinc-200 mb-5">
            <Heart className="w-4 h-4 text-[var(--sage)] fill-[var(--sage)]" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-600">
              Saved Items
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-zinc-900">
            Wishlist
          </h1>

          <p className="mt-3 text-sm md:text-base text-zinc-500 max-w-xl mx-auto">
            Save the products you love and revisit them anytime.
          </p>
        </div>

        {/* Loading */}
        {(status === "loading" || isLoading) && (
          <Loading type="wishlist" />
        )}

        {/* Empty State */}
        {isReady && favorites.length === 0 && (
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center">
            <img
              src="document.png"
              alt="favorites"
              className="w-28 h-28 mx-auto opacity-70"
            />

            <h2 className="mt-6 text-2xl font-medium text-zinc-900">
              Your wishlist is empty
            </h2>

            <p className="mt-3 text-zinc-500">
              Browse products and tap the heart icon to save your favorite pieces.
            </p>

            <button
              onClick={() => router.push("/collections/all")}
              className="mt-8 px-8 py-3 rounded-xl bg-[var(--sage)] text-white shadow-md hover:scale-[1.02] hover:opacity-90 transition"
            >
              Browse Collections
            </button>
          </div>
        )}

        {/* Grid */}
        <div
          className="grid gap-7 w-full"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {favorites.map(({ _id, productId }) => {
            const isDeleted = !productId;

            return (
              <div
                key={_id}
                className="group rounded-sm bg-white border border-zinc-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {isDeleted ? (
                  <>
                    <div className="h-[360px] bg-zinc-100 flex items-center justify-center">
                      <PackageX className="w-14 h-14 text-zinc-400" />
                    </div>

                    <div className="p-5">
                      <h2 className="text-lg font-medium text-zinc-900">
                        Deleted Product
                      </h2>

                      <p className="text-sm text-zinc-500 mt-2">
                        This item is no longer available.
                      </p>
                    </div>
                  </>
                ) : (
                  <Link
                    href={`/collection/${productId.slug}`}
                    className="block"
                  >
                    {/* Image */}
                    <div className="relative h-[380px] bg-zinc-50 overflow-hidden flex items-center justify-center">
                      <Image
                        src={productId.image?.[0] || "/placeholder.png"}
                        alt={productId.name}
                        width={420}
                        height={420}
                        className="w-[82%] h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-400 mb-2">
                        {productId.brand}
                      </p>

                      <h3 className="text-lg font-medium text-zinc-900 leading-snug line-clamp-2 min-h-[56px]">
                        {toTitleCase(productId.name)} · {" "}
                        {toTitleCase(productId.color)}
                      </h3>

                      <p className="text-lg font-normal text-zinc-900">
                        {currency}
                        {Number(productId.offerPrice).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                )}

                {/* Footer Action */}
                <div className="border-t border-zinc-100 px-5 py-4">
                  <button
                    onClick={() => removeFavorite(productId?._id || _id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl cursor-pointer border border-red-200 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
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
