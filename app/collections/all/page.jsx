"use client";

import { Suspense, useMemo } from "react";
import {
  useSearchParams,
  usePathname,
  useRouter,
} from "next/navigation";

import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Filter from "@/components/Filter";
import { useAppContext } from "@/context/AppContext";
import { PackageSearch, ChevronLeft, ChevronRight, Frown, ListFilter, SlidersHorizontal } from "lucide-react";
import ProductSlider from "@/components/ProductSlider";

const PRODUCTS_PER_PAGE = 25;

export default function Page() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <AllProducts />
    </Suspense>  
  );
}

const AllProducts = () => {
  const { products, loading, themeColor, secondaryColor, tertiaryColor, fontSize, layoutStyle, layoutStyle: effectiveLayout } = useAppContext();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const minRaw = searchParams.get("min");
  const maxRaw = searchParams.get("max");
  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const brand = searchParams.get("brand") || "";
  const color = searchParams.get("color") || "";
  const searchQuery = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const pageRaw = searchParams.get("page");

  const min = minRaw !== null && !isNaN(parseFloat(minRaw)) ? parseFloat(minRaw) : 0;
  const max = maxRaw !== null && !isNaN(parseFloat(maxRaw)) ? parseFloat(maxRaw) : Infinity;
  const currentPage = pageRaw && !isNaN(parseInt(pageRaw)) && parseInt(pageRaw) > 0 ? parseInt(pageRaw) : 1;

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (type) filtered = filtered.filter((p) => p.type === type);
    if (category) filtered = filtered.filter((p) => p.category === category);
    if (brand) filtered = filtered.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    if (color) filtered = filtered.filter((p) => p.color?.toLowerCase() === color.toLowerCase());

    filtered = filtered.filter((p) => {
      const offerPrice = typeof p.offerPrice === "string" ? parseFloat(p.offerPrice) : p.offerPrice;
      return !isNaN(offerPrice) && offerPrice >= min && offerPrice <= max;
    });

    if (sort === "asc price") {
      filtered.sort((a, b) => parseFloat(a.offerPrice) - parseFloat(b.offerPrice));
    } else if (sort === "desc price") {
      filtered.sort((a, b) => parseFloat(b.offerPrice) - parseFloat(a.offerPrice));
    } else if (sort === "asc date") {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sort === "desc date") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, type, category, brand, color, min, max, searchQuery, sort]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        {/* <ProductSlider /> */}
        <div className="w-full flex justify-center items-center h-96 text-lg text-gray-600">
          Please wait...
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* <Navbar /> */}
      {/* <ProductSlider /> */}
      <div className="flex flex-col items-start px-4 md:px-8 mt-10 lg:px-8 pt-8">
        {/* Header */}
        <div className="w-full flex items-center justify-center border-b pb-6">
          {/* HEADER */}
          <div className="text-center">
            <p className="text-sm md:text-lg text-black uppercase tracking-[0.25em]">
              products
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-6 w-full bg-white p-4">
          <Filter 
            searchQuery={searchQuery} 
            brand={brand} 
            color={color} 
            displayCount={filteredProducts.length}
            totalCount={products.length} 
          />
        </div>
        
        {/* Products / Empty State */}
        {paginatedProducts.length === 0 ? (
          <div className="w-full flex flex-col items-center justify-center mt-20 mb-20 text-gray-600">
            <Frown className="w-14 h-14 text-gray-400 mb-4" />
            <p className="text-lg font-medium">
              No products found matching your criteria.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting filters or check back later.
            </p>
          </div>
        ) : (
          <div 
            className="
                mt-12 pb-14 w-full grid grid-cols-2 
                sm:grid-cols-3 lg:grid-cols-4 gap-y-4 gap-x-4 sm:gap-6 
                lg:gap-8 w-full max-w-7xl
              "
            >
            {paginatedProducts.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full flex justify-center mt-12 mb-16">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white shadow border max-w-fit">
              {/* Prev */}
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1 rounded border text-sm font-medium transition ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              {/* Page numbers */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;

                if (totalPages <= 7) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      className={`px-3 py-1 rounded border text-sm font-medium transition ${
                        pageNum === currentPage
                          ? "bg-orange-600 text-white"
                          : "bg-white text-gray-800 hover:bg-orange-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }

                const isVisible =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                if (isVisible) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      className={`px-3 py-1 rounded border text-sm font-medium transition ${
                        pageNum === currentPage
                          ? "bg-orange-600 text-white"
                          : "bg-white text-gray-800 hover:bg-orange-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }

                if (
                  (pageNum === 2 && currentPage > 4) ||
                  (pageNum === totalPages - 1 && currentPage < totalPages - 3)
                ) {
                  return (
                    <span
                      key={pageNum}
                      className="px-2 text-gray-400 select-none"
                    >
                      ...
                    </span>
                  );
                }

                return null;
              })}

              {/* Next */}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1 rounded border text-sm font-medium transition ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-orange-100"
                }`}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};
