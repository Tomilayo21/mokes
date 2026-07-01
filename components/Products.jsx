"use client";

import { useState } from "react";
import useSWR from "swr";
import ProductCard from "./ProductCard";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";


const fetcher = (url) => fetch(url).then(res => res.json());


const Products = () => {
  const { data, isLoading } = useSWR("/api/product/list", fetcher);
  
  const router = useRouter();

  const [visibleCount, setVisibleCount] = useState(10);
  
  // if (isLoading) {
  //   return <Loading type="homeProducts" />;
  // }

  if (isLoading) {
    return <p></p>;
  }

  const products = data?.products || [];

  const visibleProducts = products.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  return (
    <div className="flex flex-col items-center mt-24 mb-12 px-4">

      {/* HEADER */}
      <div className="text-center">
        <p className="text-sm md:text-lg text-black uppercase tracking-[0.25em]">
          everyone's obsessed
        </p>

        <p className="text-xs md:text-sm text-zinc-500 mt-2">
          Better-for-you styles you'll love, too
        </p>
      </div>

      {/* SECTION TITLE */}
      <div className="mt-8 text-center">
        <p className="text-sm md:text-lg text-black uppercase tracking-widest">
          shop cult's favorites
        </p>
      </div>

      {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-4 gap-x-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 md:px-12 lg:px-20 mt-12 w-full max-w-7xl">
          {visibleProducts.map((product, index) => (
              <ProductCard key={index} product={product} />
          ))}
        </div>

        {visibleCount < products.length ? (
          <button
            onClick={handleLoadMore}
            className="px-12 py-2.5 mt-12 cursor-pointer border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            Load more
          </button>
        ) : (
          products.length > 8 && (
            <button
              onClick={() => router.push('/collections/all')}
              className="px-12 py-2.5 mt-4 cursor-pointer border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
            >
              See all
            </button>
          )
        )}
    </div>
  );
};

export default Products;