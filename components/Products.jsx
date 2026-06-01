"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";
import { useRouter } from "next/navigation";

const fetcher = (url) => fetch(url).then(res => res.json());


const Products = () => {
  const { data, isLoading } = useSWR("/api/product/list", fetcher);
  const router = useRouter();

  if (isLoading) return <p>Loading...</p>;

  const products = data?.products || [];

  const [visibleCount, setVisibleCount] = useState(10);

  const visibleProducts = products.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  return (
    <div className="flex flex-col items-center mt-24 mb-24 px-4">

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
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-y-4 gap-x-4 sm:gap-6 lg:gap-8 px-4 sm:px-6 md:px-12 lg:px-20 mt-12 w-full max-w-7xl">
          {visibleProducts.map((product, index) => (
              <ProductCard key={index} product={product} />
          ))}
        </div> */}

        {/* {visibleCount < products.length ? (
          <button
            onClick={handleLoadMore}
            className="px-12 py-2.5 mt-12 cursor-pointer border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
          >
            Load more
          </button>
        ) : (
          products.length > 10 && (
            <button
              onClick={() => router.push('/collections')}
              className="px-12 py-2.5 mt-12 cursor-pointer border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
            >
              See all
            </button>
          )
        )} */}
    </div>
  );
};

export default Products;