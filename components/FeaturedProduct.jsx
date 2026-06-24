"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const FeaturedProduct = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTopBrands = async () => {
    try {
      const res = await fetch("/api/product/list");
      const data = await res.json();

      if (!data.success) throw new Error("Failed to fetch products");

      const products = data.products;

      // STEP 1: group brands
      const brandMap = {};

      products.forEach((p) => {
        if (!p.brand) return;

        const key = typeof p.brand === "string" ? p.brand : p.brand.name;

        if (!brandMap[key]) {
          brandMap[key] = {
            name: key,
            count: 0,
            image: p.brandImage || p.image?.[0], // fallback image
          };
        }

        brandMap[key].count += 1;
      });

      // STEP 2: convert to array + sort
      const sortedBrands = Object.values(brandMap)
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      setBrands(sortedBrands);
    } catch (err) {
      console.error("Error fetching top brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopBrands();
  }, []);

  const handleBrandClick = (brandName) => {
    router.push(
      `/collections/all?brand=${encodeURIComponent(brandName)}`
    );
  };

  // if (loading) return <Loading type="brand" />;

  return (
    <div className="flex flex-col mt-24 items-center">
      {/* HEADER */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex justify-center">
        <div className="text-center text-black">
          <p className="text-sm md:text-lg uppercase tracking-[0.25em] whitespace-nowrap">
            Your local modern fashion boutique
          </p>

          <p className="text-xs md:text-sm text-zinc-500 mt-2 tracking-wide">
            Curated pieces made for everyday elegance
          </p>
        </div>
      </div>

      {/* TITLE */}
      <div className="mt-20 w-full max-w-6xl">
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex justify-center">
             <div className="text-center text-black">
                 <p className="text-sm md:text-lg uppercase tracking-widest whitespace-nowrap">
                 Top Brands
                 </p>
             </div>
         </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 px-4">
          {loading ? (
            <p className="text-center col-span-2 text-gray-500">
              
            </p>
          ) : (
            brands.map((brand, i) => (
              <div
                key={i}
                onClick={() => handleBrandClick(brand.name)}
                className="relative group overflow-hidden shadow-lg bg-white cursor-pointer"
              >
                <Image
                  src={brand.image}
                  alt={brand.name}
                  width={600}
                  height={800}
                  className="w-full h-[420px] md:h-[500px] object-cover group-hover:scale-105 transition duration-500"
                />

                {/* BRAND NAME */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-white text-2xl md:text-3xl font-light uppercase tracking-wide backdrop-blur-sm px-4 py-2">
                    {brand.name}
                  </h2>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProduct;