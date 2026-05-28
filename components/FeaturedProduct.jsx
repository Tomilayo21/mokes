// "use client";

// import { useEffect, useState } from "react";
// import { ShoppingCart, Package, Tag, ArrowRight } from "lucide-react";
// import Image from "next/image";

// // Dummy products
// const dummyProducts = [
//   {
//     _id: "5",
//     name: "Classic White Tee",
//     image: [
//       "/anomaly-WWesmHEgXDs-unsplash.jpg"
//     ],
//     visible: true,
//   },
//   {
//     _id: "2",
//     name: "Oversized Hoodie",
//     image: [
//       "/redicul-pict-ggcJKGpx3pI-unsplash.jpg"
//     ],
//     visible: true,
//   },
//   {
//     _id: "3",
//     name: "Minimal Jacket",
//     image: [
//       "/lea-ochel-nsRBbE6-YLs-unsplash.jpg"
//     ],
//     visible: true,
//   },
//   {
//     _id: "4",
//     name: "Relaxed Street Pants",
//     image: [
//       "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80"
//     ],
//     visible: true,
//   },
// ];

// const FeaturedProduct = () => {
//   const id = "1"; // static dummy id

//   const [mainImage, setMainImage] = useState(null);
//   const [productData, setProductData] = useState(null);

//   const fetchProductData = () => {
//     const product = dummyProducts.find((p) => p._id === id);

//     if (!product || !product.visible) {
//       console.log("Product not found");
//       return;
//     }

//     setProductData(product);
//     setMainImage(product.image?.[0]);
//   };

//   useEffect(() => {
//     fetchProductData();
//   }, []);

//   return (
//     <div className="flex flex-col mt-24 items-center">
//         <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex justify-center">
//             <div className="text-center text-black">

//                 {/* Big caption */}
//                 <p className="text-sm md:text-lg uppercase tracking-[0.25em] whitespace-nowrap">
//                 Your local modern fashion boutique
//                 </p>

//                 {/* Small wording below */}
//                 <p className="text-xs md:text-sm text-zinc-500 mt-2 tracking-wide">
//                 Curated pieces made for everyday elegance
//                 </p>

//             </div>
//         </div>

//       {/* FEATURED GRID */}
//       <div className="mt-20 w-full max-w-6xl">

//         <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full flex justify-center">
//             <div className="text-center text-black">
//                 <p className="text-sm md:text-lg uppercase tracking-widest whitespace-nowrap">
//                 Featured Collections
//                 </p>
//             </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 px-4">

//             {dummyProducts
//             .filter((p) => p._id !== id)
//             .map((product) => (
//             <div
//             key={product._id}
//             className="relative group overflow-hidden shadow-lg bg-white"
//             >
//             {/* Image */}
//             <Image
//                 src={product.image[0]}
//                 alt={product.name}
//                 width={600}
//                 height={800}
//                 className="w-full h-[420px] md:h-[500px] object-cover group-hover:scale-105 transition duration-500"
//             />

//             {/* Centered Name Overlay */}
//             <div className="absolute inset-0 flex items-center justify-center">
//                 <h2 className="text-white text-2xl md:text-2xl font-light tracking-wide uppercase px-4 py-2 backdrop-blur-sm">
//                 {product.name}
//                 </h2>
//             </div>
//             </div>
//             ))}

//         </div>
//       </div>

//     </div>
//   );
// };

// export default FeaturedProduct;
































































"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const FeaturedProduct = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

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
              Loading brands...
            </p>
          ) : (
            brands.map((brand, i) => (
              <div
                key={i}
                className="relative group overflow-hidden shadow-lg bg-white"
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