// "use client";

// import * as Select from "@radix-ui/react-select";
// import { ChevronDown, SlidersHorizontal, ListFilter } from "lucide-react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { useState, useMemo } from "react";
// import { useAppContext } from "@/context/AppContext";

// type FilterBarProps = {
//   displayCount: number;
//   totalCount: number;
// };

// export default function FilterBar({ displayCount, totalCount }: FilterBarProps) {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const [showFilters, setShowFilters] = useState(false);
//   const { currency } = useAppContext();

//   const handleFilterChange = (name: string, value: string) => {
//     const params = new URLSearchParams(searchParams.toString());

//     // ✅ PRICE FILTER (handled separately)
//     if (name === "price") {
//       params.delete("min");
//       params.delete("max");

//       const newUrl = `${window.location.pathname}?${params.toString()}`;
//       router.push(newUrl);
//       return;
//     }

//     // ❌ CLEAR OLD FILTERS ALWAYS (important for consistency)
//     params.delete("category");
//     params.delete("subcategory");
//     params.delete("color");
//     params.delete("brand");

//     // ❌ If empty value → remove filter completely
//     if (!value) {
//       params.delete("filter");
//     } else {
//       // ✅ SINGLE UNIFIED FILTER SYSTEM
//       params.set("filter", value);
//     }

//     const newUrl = `${window.location.pathname}?${params.toString()}`;
//     router.push(newUrl);
//   };

//   const triggerClasses =
//     "flex items-center justify-between w-full sm:w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white";

//   const itemClasses =
//     "text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 data-[state=checked]:bg-gray-200 dark:data-[state=checked]:bg-gray-600";

//   const formatLabel = (type: string, value: string) => {
//     const map: Record<string, Record<string, string>> = {
//       category: {
//         men: "Men",
//         women: "Women",
//         watch: "Watches",
//         headphone: "Headphones",
//       },
//       subcategory: {
//         male: "Men",
//         female: "Women",
//         linen: "Linen",
//         cotton: "Cotton",
//         tees: "Tees",
//       },
//       color: {
//         black: "Black",
//         white: "White",
//         blue: "Blue",
//         red: "Red",
//       },
//       brand: {
//         apple: "Apple",
//         samsung: "Samsung",
//         sony: "Sony",
//       },
//     };

//     return map[type]?.[value.toLowerCase()] || value;
//   };

//   const summaryChips = useMemo(() => {
//     const filter = searchParams.get("filter");
//     const brand = searchParams.get("brand");
//     const min = searchParams.get("min");
//     const max = searchParams.get("max");
//     const sort = searchParams.get("sort");

//     const chips = [];

//     if (filter) {
//       chips.push({
//         name: "filter",
//         label: filter,
//       });
//     }

//     if (brand) {
//       chips.push({
//         name: "brand",
//         label: brand,
//       });
//     }

//     if (min || max) {
//       chips.push({
//         name: "price",
//         label: `${min || 0} - ${max || "∞"}`,
//       });
//     }

//     const sortLabels = {
//       "asc price": "Price (low → high)",
//       "desc price": "Price (high → low)",
//       "asc date": "Oldest",
//       "desc date": "Newest",
//     };

//     if (sort) {
//       chips.push({
//         name: "sort",
//         label: sortLabels[sort] || sort,
//       });
//     }

//     return chips;
//   }, [searchParams.toString()]);

//   const collectionOptions = [
//     // Categories
//     { label: "Male", value: "category:Male" },
//     { label: "Female", value: "category:Female" },

//     // Subcategories
//     { label: "Linen", value: "subcategory:Linen" },
//     { label: "Cotton", value: "subcategory:Cotton" },
//     { label: "Watch", value: "subcategory:Watch" },
//     { label: "Tees", value: "subcategory:Tees" },
//     { label: "Sweaters", value: "subcategory:Sweaters" },
//     { label: "Jackets", value: "subcategory:Jackets" },
//     { label: "Pants", value: "subcategory:Pants" },
//     { label: "Accessories", value: "subcategory:Accessories" },

//     // Colors
//     { label: "Black", value: "color:Black" },
//     { label: "White", value: "color:White" },
//     { label: "Blue", value: "color:Blue" },
//     { label: "Red", value: "color:Red" },
//   ];

//   return (
//     <div className="flex flex-col gap-4 md:gap-6">
//       {/* === Summary Chips (Now Above Filters) === */}
//         <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-gray-700">
//         {summaryChips.length > 0 && (
//           <>
//             <span className="font-medium text-gray-500 mr-1">
//               Showing results for:
//             </span>

//             {summaryChips.map((chip, idx) => (
//               <span
//                 key={idx}
//                 className="flex items-center gap-1 px-2 py-1 bg-gray-50 text-[var(--sage)] border border-zinc-500 rounded-sm text-xs md:text-sm"
//               >
//                 {chip.label}
//                 <button
//                   onClick={() => {
//                     const params = new URLSearchParams(searchParams.toString());

//                     if (chip.name === "price") {
//                       params.delete("min");
//                       params.delete("max");
//                     } else {
//                       params.delete(chip.name);
//                     }

//                     router.push(`${window.location.pathname}?${params.toString()}`);
//                   }}
//                   className="ml-1 text-[var(--sage)] hover:text-[var(--sage-dark]) focus:outline-none"
//                   aria-label={`Remove ${chip.label}`}
//                 >
//                   ×
//                 </button>
//               </span>
//             ))}

//             {/* === Clear All Button === */}
//             <button
//               onClick={() => {
//                 const params = new URLSearchParams(window.location.search);
//                 params.delete("category");
//                 params.delete("brand");
//                 params.delete("color");
//                 params.delete("min");
//                 params.delete("max");
//                 params.delete("sort");
//                 const newUrl = `${window.location.pathname}`;
//                 router.push(newUrl); // navigates to base path (cleared filters)
//               }}
//               className="ml-2 text-xs md:text-sm text-gray-600 hover:text-gray-800 font-medium underline decoration-underline-offset-2"
//             >
//               Clear all
//             </button>
//           </>
//         )}
//       </div>

//       {/* === Filter Controls === */}
//       <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
//         {/* Left section: Filters */}
//         <div className="w-full md:w-auto">
//           {/* Mobile Toggle */}
//           <button
//             className="flex items-center justify-between w-full md:hidden bg-white py-3"
//             onClick={() => setShowFilters(!showFilters)}
//           >
//             <div className="flex items-center gap-2">
//               <SlidersHorizontal className="w-4 h-4 text-black" />
//               <span className="text-sm font-normal text-black">Filters</span>
//             </div>
//             <span className="text-xs text-gray-500 cursor-pointer">
//               {showFilters ? "Hide" : "Show"}
//             </span>
//           </button>

//           {/* Accordion Body */}
//           <div
//             className={`transition-all duration-300 ${
//               showFilters ? "max-h-screen mt-3" : "max-h-0 overflow-hidden"
//             } md:max-h-none md:mt-0`}
//           >
//             <div className="flex flex-col sm:flex-row flex-wrap items-start gap-4 bg-white px-4 py-3">
//               <div className="flex flex-col w-full sm:w-auto">
//                 <label className="text-xs font-medium text-gray-500 mb-1 block">
//                   Filter by
//                 </label>

//                 <Select.Root
//                   value={searchParams.get("filter") || ""}
//                   onValueChange={(value) => {
//                     const params = new URLSearchParams(searchParams.toString());

//                     // 🧹 WIPE ALL OLD FILTERS COMPLETELY
//                     params.delete("category");
//                     params.delete("subcategory");
//                     params.delete("color");
//                     params.delete("brand");

//                     if (!value) {
//                       params.delete("filter");
//                     } else {
//                       const [, val] = value.split(":");
//                       params.set("filter", val.toLowerCase());
//                     }

//                     router.push(`${window.location.pathname}?${params.toString()}`);
//                   }}
//                 >
//                   <Select.Trigger
//                     className={`${triggerClasses} w-auto min-w-[12rem] flex items-center justify-between`}
//                   >
//                     <span className="text-gray-500 text-xs capitalize">
//                       {searchParams.get("category") ||
//                         searchParams.get("subcategory") ||
//                         searchParams.get("color") ||
//                         "All collections"}
//                     </span>

//                     <Select.Icon>
//                       <ChevronDown className="w-4 h-4 text-gray-500" />
//                     </Select.Icon>
//                   </Select.Trigger>

//                   <Select.Portal>
//                     <Select.Content
//                       position="popper"
//                       side="bottom"
//                       align="start"
//                       sideOffset={6}
//                       className="bg-white border border-gray-300 rounded-sm text-black shadow z-[9999] overflow-hidden"
//                     >


//                       <Select.Viewport className="px-3 py-2 max-h-100 overflow-y-auto">
//                         {collectionOptions.map((option) => (
//                           <Select.Item
//                             key={option.value}
//                             value={option.value}
//                             className={`${itemClasses} block`}
//                           >
//                             <Select.ItemText>
//                               {option.label}
//                             </Select.ItemText>
//                           </Select.Item>
//                         ))}
//                       </Select.Viewport>

//                     </Select.Content>
//                   </Select.Portal>
//                 </Select.Root>
//               </div>
//               {/* Generic Selects */}
//               {[
//                 {
//                   name: "brand",
//                   label: "Brand",
//                   options: [
//                     "Apple",
//                     "Samsung",
//                     "Sony",
//                     "Bose",
//                     "Beats",
//                     "Dell",
//                   ],
//                 },
//               ].map((filter) => (
//                 <div
//                   key={filter.name}
//                   className="flex flex-col w-full sm:w-auto relative"
//                 >
//                   <label className="text-xs font-medium text-gray-500 mb-1 block">
//                     {filter.label}
//                   </label>
//                   <Select.Root
//                     defaultValue={searchParams.get(filter.name) || undefined}
//                     onValueChange={(value) =>
//                       handleFilterChange(filter.name, value)
//                     }
//                   >
//                     <Select.Trigger
//                       className={`${triggerClasses} w-auto min-w-[8rem] flex items-center justify-between`}
//                     >
//                       <div className="text-gray-500 text-xs">
//                         {searchParams.get(filter.name) || `Select ${filter.label.toLowerCase()}`}
//                       </div>
//                       <Select.Icon>
//                         <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
//                       </Select.Icon>
//                     </Select.Trigger>



//                     <Select.Content
//                       position="popper"
//                       side="bottom"
//                       align="start"
//                       className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1 w-full sm:w-auto"
//                     >
//                       <Select.Viewport className="p-2">
//                         {filter.options.map((opt) => (
//                           <Select.Item
//                             key={opt}
//                             value={opt}
//                             className={itemClasses}
//                           >
//                             {opt}
//                           </Select.Item>
//                         ))}
//                       </Select.Viewport>
//                     </Select.Content>
//                   </Select.Root>
//                 </div>
//               ))}

//               <div className="flex flex-col w-full sm:w-auto">
//                 <label className="text-xs font-medium text-gray-500 mb-1 block">
//                   Sort
//                 </label>

//                   <Select.Root
//                     defaultValue={searchParams.get("sort") || undefined}
//                     onValueChange={(value) => handleFilterChange("sort", value)}
//                   >
//                     <Select.Trigger
//                       className={`${triggerClasses} w-auto min-w-[9rem] flex items-center justify-between gap-2`}
//                     >
//                       {/* === Left Section: Icon + Label === */}
//                       <div className="flex items-center gap-2 text-gray-500 text-xs">
//                         <ListFilter className="w-4 h-4 text-gray-500" />
//                         <span>
//                           {(() => {
//                             const sort = searchParams.get("sort");
//                             if (sort === "asc price") return "Price (low → high)";
//                             if (sort === "desc price") return "Price (high → low)";
//                             if (sort === "asc date") return "Oldest";
//                             if (sort === "desc date") return "Newest";
//                             return "Sort order";
//                           })()}
//                         </span>
//                       </div>

//                       {/* === Right Section: Chevron === */}
//                       <Select.Icon>
//                         <ChevronDown className="w-4 h-4 text-gray-500" />
//                       </Select.Icon>
//                     </Select.Trigger>

//                     <Select.Content
//                       position="popper"
//                       side="bottom"
//                       align="start"
//                       className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg z-50 mt-1 w-full sm:w-auto"
//                     >
//                       <Select.Viewport className="p-2">
//                         {[
//                           { label: "Price (low → high)", value: "asc price" },
//                           { label: "Price (high → low)", value: "desc price" },
//                           { label: "Newest", value: "desc date" },
//                           { label: "Oldest", value: "asc date" },
//                         ].map((item) => (
//                           <Select.Item
//                             key={item.value}
//                             value={item.value}
//                             className={itemClasses}
//                           >
//                             {item.label}
//                           </Select.Item>
//                         ))}
//                       </Select.Viewport>
//                     </Select.Content>
//                   </Select.Root>
//               </div>

//             </div>
//           </div>
//         </div>

//         {/* Right section: Sort */}
//         <div className="flex flex-col w-full sm:w-auto mt-3 md:mt-0">
//           <p className="text-xs text-gray-500 italic">
//             Showing{" "}
//             <span className="font-medium">{displayCount}</span>{" "}
//             of{" "}
//             <span className="font-medium">{totalCount}</span>{" "}
//             items
//           </p>
//         </div>

//       </div>
//     </div>
//   );
// }



































































































































// "use client";

// import { Suspense, useMemo } from "react";
// import {
//   useSearchParams,
//   usePathname,
//   useRouter,
// } from "next/navigation";

// import ProductCard from "@/components/ProductCard";
// import Navbar from "@/components/Navbar";
// import Footer from "@/components/Footer";
// import Filter from "@/components/Filter";
// import { useAppContext } from "@/context/AppContext";
// import { PackageSearch, ChevronLeft, ChevronRight, Frown, ListFilter, SlidersHorizontal } from "lucide-react";
// import ProductSlider from "@/components/ProductSlider";

// const PRODUCTS_PER_PAGE = 25;

// export default function Page() {
//   return (
//     <Suspense fallback={<div>Loading products...</div>}>
//       <AllProducts />
//     </Suspense>  
//   );
// }

// const AllProducts = () => {
//   const { products, loading, themeColor, secondaryColor, tertiaryColor, fontSize, layoutStyle, layoutStyle: effectiveLayout } = useAppContext();
//   const searchParams = useSearchParams();
//   const pathname = usePathname();
//   const router = useRouter();

//   const minRaw = searchParams.get("min");
//   const maxRaw = searchParams.get("max");
//   const type = searchParams.get("type") || "";
//   // const category = searchParams.get("category") || "";
//   // const subcategory = searchParams.get("subcategory") || "";
//   const brand = searchParams.get("brand") || "";
//   const color = searchParams.get("color") || "";
//   const searchQuery = searchParams.get("search") || "";
//   const sort = searchParams.get("sort") || "";
//   const pageRaw = searchParams.get("page");
//   const filterValue = searchParams.get("filter") || "";

//   const min = minRaw !== null && !isNaN(parseFloat(minRaw)) ? parseFloat(minRaw) : 0;
//   const max = maxRaw !== null && !isNaN(parseFloat(maxRaw)) ? parseFloat(maxRaw) : Infinity;
//   const currentPage = pageRaw && !isNaN(parseInt(pageRaw)) && parseInt(pageRaw) > 0 ? parseInt(pageRaw) : 1;

//   const filteredProducts = useMemo(() => {
//     let filtered = [...products];

//     if (type) filtered = filtered.filter((p) => p.type === type);
//     if (brand)
//       filtered = filtered.filter(
//         (p) => p.brand?.toLowerCase() === brand.toLowerCase()
//       );

//     // ✅ unified filter (category + subcategory + color + name)
//     const normalize = (v) => v?.toLowerCase().trim().replace(/s$/, ""); 
//     if (filterValue) {
//       const value = normalize(filterValue);

//       filtered = filtered.filter((p) => {
//         const category = normalize(p.category);
//         const subCategory = normalize(p.subCategory || p.subcategory);
//         const color = normalize(p.color);
//         const brand = normalize(p.brand);
//         const name = p.name?.toLowerCase();

//         return (
//           category === value ||
//           subCategory === value ||
//           color === value ||
//           brand === value ||
//           name?.includes(value)
//         );
//       });
//     }
//     filtered = filtered.filter((p) => {
//       const offerPrice =
//         typeof p.offerPrice === "string"
//           ? parseFloat(p.offerPrice)
//           : p.offerPrice;

//       return !isNaN(offerPrice) && offerPrice >= min && offerPrice <= max;
//     });

//     if (sort === "asc price") {
//       filtered.sort((a, b) => parseFloat(a.offerPrice) - parseFloat(b.offerPrice));
//     } else if (sort === "desc price") {
//       filtered.sort((a, b) => parseFloat(b.offerPrice) - parseFloat(a.offerPrice));
//     } else if (sort === "asc date") {
//       filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
//     } else if (sort === "desc date") {
//       filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
//     }

//     if (searchQuery) {
//       filtered = filtered.filter(
//         (p) =>
//           p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           p.description?.toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return filtered;
//   }, [
//     products,
//     type,
//     brand,
//     filterValue,
//     min,
//     max,
//     searchQuery,
//     sort,
//   ]);

//   const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
//   const paginatedProducts = filteredProducts.slice(
//     (currentPage - 1) * PRODUCTS_PER_PAGE,
//     currentPage * PRODUCTS_PER_PAGE
//   );

//   const changePage = (newPage) => {
//     if (newPage < 1 || newPage > totalPages) return;
//     const params = new URLSearchParams(searchParams.toString());
//     params.set("page", newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   if (loading) {
//     return (
//       <>
//         <Navbar />
//         {/* <ProductSlider /> */}
//         <div className="w-full flex justify-center items-center h-96 text-lg text-gray-600">
//           Please wait...
//         </div>
//         <Footer />
//       </>
//     );
//   }

//   return (
//     <>
//       {/* <Navbar /> */}
//       {/* <ProductSlider /> */}
//       <div className="flex flex-col items-start px-4 md:px-8 mt-10 lg:px-8 pt-8">
//         {/* Header */}
//         <div className="w-full flex items-center justify-center border-b pb-6">
//           {/* HEADER */}
//           <div className="text-center">
//             <p className="text-sm md:text-lg text-black uppercase tracking-[0.25em]">
//               products
//             </p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="mt-6 w-full bg-white p-4">
//           <Filter 
//             searchQuery={searchQuery} 
//             brand={brand} 
//             displayCount={filteredProducts.length}
//             totalCount={products.length} 
//           />
//         </div>
        
//         {/* Products / Empty State */}
//         {paginatedProducts.length === 0 ? (
//           <div className="w-full flex flex-col items-center justify-center mt-20 mb-20 text-gray-600">
//             <Frown className="w-14 h-14 text-gray-400 mb-4" />
//             <p className="text-lg font-medium">
//               No products found matching your criteria.
//             </p>
//             <p className="text-sm text-gray-500 mt-1">
//               Try adjusting filters or check back later.
//             </p>
//           </div>
//         ) : (
//           <div 
//             className="
//                 mt-12 pb-14 w-full grid grid-cols-2 
//                 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-4 sm:gap-6 
//                 lg:gap-8 w-full max-w-7xl
//               "
//             >
//             {paginatedProducts.map((product, index) => (
//               <ProductCard key={index} product={product} />
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="w-full flex justify-center mt-12 mb-16">
//             <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white shadow border max-w-fit">
//               {/* Prev */}
//               <button
//                 onClick={() => changePage(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 className={`flex items-center gap-1 px-3 py-1 rounded border text-sm font-medium transition ${
//                   currentPage === 1
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-white text-gray-700 hover:bg-orange-100"
//                 }`}
//               >
//                 <ChevronLeft className="w-4 h-4" /> Prev
//               </button>

//               {/* Page numbers */}
//               {[...Array(totalPages)].map((_, index) => {
//                 const pageNum = index + 1;

//                 if (totalPages <= 7) {
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => changePage(pageNum)}
//                       className={`px-3 py-1 rounded border text-sm font-medium transition ${
//                         pageNum === currentPage
//                           ? "bg-orange-600 text-white"
//                           : "bg-white text-gray-800 hover:bg-orange-100"
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 }

//                 const isVisible =
//                   pageNum === 1 ||
//                   pageNum === totalPages ||
//                   (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

//                 if (isVisible) {
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => changePage(pageNum)}
//                       className={`px-3 py-1 rounded border text-sm font-medium transition ${
//                         pageNum === currentPage
//                           ? "bg-orange-600 text-white"
//                           : "bg-white text-gray-800 hover:bg-orange-100"
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 }

//                 if (
//                   (pageNum === 2 && currentPage > 4) ||
//                   (pageNum === totalPages - 1 && currentPage < totalPages - 3)
//                 ) {
//                   return (
//                     <span
//                       key={pageNum}
//                       className="px-2 text-gray-400 select-none"
//                     >
//                       ...
//                     </span>
//                   );
//                 }

//                 return null;
//               })}

//               {/* Next */}
//               <button
//                 onClick={() => changePage(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 className={`flex items-center gap-1 px-3 py-1 rounded border text-sm font-medium transition ${
//                   currentPage === totalPages
//                     ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                     : "bg-white text-gray-700 hover:bg-orange-100"
//                 }`}
//               >
//                 Next <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//       <Footer />
//     </>
//   );
// };
