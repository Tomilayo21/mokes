"use client";

import { Suspense, useMemo, useEffect, useState } from "react";
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
import Loading from "@/components/Loading";
const PRODUCTS_PER_PAGE = 25;

export default function Page() {
  return (
    <Suspense fallback={<div>Loading products...</div>}>
      <AllProducts />
    </Suspense>  
  );
}

const AllProducts = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const currency = "₦";
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch("/api/product/list");
        const data = await res.json();

        const safeProducts = Array.isArray(data)
          ? data
          : data?.products || [];

        setProducts(safeProducts);
      } catch (err) {
        console.error("Failed to load products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const minRaw = searchParams.get("min");
  const maxRaw = searchParams.get("max");
  const type = searchParams.get("type") || "";
  const brand = searchParams.get("brand") || "";
  const color = searchParams.get("color") || "";
  const searchQuery = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const pageRaw = searchParams.get("page");
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";
  const min = minRaw !== null && !isNaN(parseFloat(minRaw)) ? parseFloat(minRaw) : 0;
  const max = maxRaw !== null && !isNaN(parseFloat(maxRaw)) ? parseFloat(maxRaw) : Infinity;
  const currentPage = pageRaw && !isNaN(parseInt(pageRaw)) && parseInt(pageRaw) > 0 ? parseInt(pageRaw) : 1;

  const filteredProducts = useMemo(() => {
    let filtered = Array.isArray(products) ? [...products] : [];
    filtered = filtered.filter(p => p.visible);

    if (type) filtered = filtered.filter((p) => p.type === type);
    if (brand) {
      filtered = filtered.filter((p) => {
        const productBrand =
          typeof p.brand === "string"
            ? p.brand
            : p.brand?.name;

        return productBrand?.toLowerCase() === brand.toLowerCase();
      });
    }

    // unified filter
    if (category) {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (subcategory) {
      filtered = filtered.filter(
        (p) =>
          (p.subCategory || p.subcategory)?.toLowerCase() ===
          subcategory.toLowerCase()
      );
    }

    if (color) {
      filtered = filtered.filter(
        (p) => p.color?.toLowerCase() === color.toLowerCase()
      );
    }

    filtered = filtered.filter((p) => {
      const offerPrice =
        typeof p.offerPrice === "string"
          ? parseFloat(p.offerPrice)
          : p.offerPrice;

      return !isNaN(offerPrice) && offerPrice >= min && offerPrice <= max;
    });

    if (sort === "asc alpha") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } 
    else if (sort === "desc alpha") {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } 
    else if (sort === "asc price") {
      filtered.sort((a, b) => parseFloat(a.offerPrice) - parseFloat(b.offerPrice));
    } 
    else if (sort === "desc price") {
      filtered.sort((a, b) => parseFloat(b.offerPrice) - parseFloat(a.offerPrice));
    } 
    else if (sort === "asc date") {
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } 
    else if (sort === "desc date") {
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();

    filtered = filtered.filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.subCategory?.toLowerCase().includes(q) ||
        p.subcategory?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.color?.toLowerCase().includes(q)
      );
    });
  }

    return filtered;
  }, [
    products,
    type,
    brand,
    category,
    subcategory,
    color,
    min,
    max,
    searchQuery,
    sort,
  ]);

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

  const clearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("search"); // remove search param
    params.delete("page");   // optional: reset pagination too

    const queryString = params.toString();

    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  if (loading) return <Loading type="products" />;

  return (
    <>
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
            products={filteredProducts}
            searchQuery={searchQuery}
            brand={brand}
            displayCount={paginatedProducts.length}
            totalCount={filteredProducts.length}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="text-sm mt-2 cursor-pointer text-gray-500 hover:text-black underline"
            >
              Clear search
            </button>
          )}
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
              <ProductCard key={index} product={product} currency={currency} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="w-full flex justify-center mt-12 mb-16">
            <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-zinc-200">

              {/* Prev */}
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition
                ${
                  currentPage === 1
                    ? "text-zinc-300 cursor-not-allowed"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-zinc-200 mx-1" />

              {/* Pages */}
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1;

                  const isActive = pageNum === currentPage;

                  const isVisible =
                    totalPages <= 7 ||
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                  if (!isVisible) {
                    if (
                      (pageNum === 2 && currentPage > 4) ||
                      (pageNum === totalPages - 1 && currentPage < totalPages - 3)
                    ) {
                      return (
                        <span
                          key={`dots-${pageNum}`}
                          className="px-2 text-zinc-400 select-none"
                        >
                          …
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => changePage(pageNum)}
                      className={`min-w-[36px] h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-[var(--sage)] text-white shadow-sm scale-105"
                          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="w-px h-5 bg-zinc-200 mx-1" />

              {/* Next */}
              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition
                ${
                  currentPage === totalPages
                    ? "text-zinc-300 cursor-not-allowed"
                    : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};
