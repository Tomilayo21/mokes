"use client";

import { useState, useEffect, useMemo } from "react";
import {
  IoSearch,
  IoClose,
  IoTimeOutline,
} from "react-icons/io5";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // =========================================
  // FETCH PRODUCTS FROM API
  // =========================================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const { data } = await axios.get("/api/product/list");

        console.log("API RESPONSE:", data);

        const productsArray = Array.isArray(data?.products)
          ? data.products
          : [];

        setProducts(productsArray);
      } catch (error) {
        console.log(error);
        setProducts([]); // fallback safety
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =========================================
  // BODY SCROLL LOCK
  // =========================================
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSearch]);

  // =========================================
  // RECENT SEARCHES
  // =========================================
  useEffect(() => {
    const saved = localStorage.getItem(
      "recent-searches"
    );

    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveRecentSearch = (value) => {
    if (!value.trim()) return;

    let updated = [
      value,
      ...recentSearches.filter(
        (item) =>
          item.toLowerCase() !== value.toLowerCase()
      ),
    ];

    updated = updated.slice(0, 8);

    setRecentSearches(updated);

    localStorage.setItem(
      "recent-searches",
      JSON.stringify(updated)
    );
  };

  // =========================================
  // HANDLE SEARCH
  // =========================================
  const handleSearch = (searchValue = query) => {
    if (!searchValue.trim()) return;

    saveRecentSearch(searchValue);

    router.push(
      `/collections/all?search=${encodeURIComponent(
        searchValue
      )}`
    );

    setShowSearch(false);
    setQuery("");
  };

  // =========================================
  // SEARCH SUGGESTIONS
  // =========================================
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();

    const results = [];

    (products || []).forEach((product) => {
      const searchableFields = [
        product?.name,
        product?.brand,
        product?.category,
        product?.subCategory,
        product?.subcategory,
        product?.color,
      ];

      searchableFields.forEach((field) => {
        if (
          field &&
          field
            .toString()
            .toLowerCase()
            .includes(lowerQuery)
        ) {
          results.push(field);
        }
      });
    });

    return [...new Set(results)].slice(0, 12);
  }, [query, products]);

  // =========================================
  // REAL POPULAR SEARCHES
  // =========================================
  const popularSearches = useMemo(() => {
    const allFields = [];

    (products || []).forEach((product) => {
      [
        product?.brand,
        product?.category,
        product?.subCategory,
        product?.subcategory,
        product?.color,
      ].forEach((field) => {
        if (field) {
          allFields.push(field);
        }
      });
    });

    // count occurrences
    const counts = {};

    allFields.forEach((item) => {
      const key = item.toLowerCase();

      counts[key] = {
        name: item,
        count: (counts[key]?.count || 0) + 1,
      };
    });

    // sort by frequency
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [products]);

  return (
    <>
      {/* SEARCH ICON */}
      <button
        onClick={() => setShowSearch(true)}
        className="flex items-center justify-center"
      >
        <IoSearch className="w-4 h-4 text-black cursor-pointer hover:text-black/60 transition" />
      </button>

      {/* OVERLAY */}
      <div
        className={`fixed inset-0 z-[999] transition-all duration-300 ${
          showSearch
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* BACKDROP */}
        <div
          onClick={() => setShowSearch(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* SEARCH PANEL */}
        <div
          className={`absolute top-0 left-0 w-full bg-white shadow-xl transform transition-transform duration-300 ${
            showSearch
              ? "translate-y-0"
              : "-translate-y-full"
          }`}
        >
          {/* TOP */}
          <div className="border-b border-zinc-200">
            <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center gap-4">
              <IoSearch className="text-xl text-zinc-500 shrink-0" />

              {/* FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="flex-1"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                  placeholder="Search products, brands, categories..."
                  autoFocus
                  className="
                    w-full
                    bg-transparent
                    outline-none
                    border-none
                    text-sm md:text-base
                    text-black
                    placeholder:text-zinc-400
                    tracking-wide
                  "
                />
              </form>

              {/* CLOSE */}
              <button
                onClick={() => setShowSearch(false)}
                className="shrink-0"
              >
                <IoClose className="text-2xl text-black hover:text-zinc-500 transition cursor-pointer" />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 max-h-[80vh] overflow-y-auto">

            {/* ========================= */}
            {/* SUGGESTIONS */}
            {/* ========================= */}
            {query && suggestions.length > 0 && (
              <div className="mb-10">
                <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase mb-4">
                  Suggestions
                </p>

                <div className="flex flex-col border border-zinc-200 divide-y divide-zinc-100">
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(item)}
                      className="
                        flex items-center gap-3
                        px-4 py-4
                        text-left
                        hover:bg-zinc-50
                        transition
                      "
                    >
                      <IoSearch className="text-zinc-400 shrink-0" />

                      <span className="text-sm text-black capitalize">
                        {item}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========================= */}
            {/* RECENT SEARCHES */}
            {/* ========================= */}
            {!query && recentSearches.length > 0 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase">
                    Recent Searches
                  </p>

                  <button
                    onClick={() => {
                      localStorage.removeItem(
                        "recent-searches"
                      );

                      setRecentSearches([]);
                    }}
                    className="text-xs text-zinc-500 cursor-pointer hover:text-black transition"
                  >
                    Clear
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 text-black">
                  {recentSearches.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(item)}
                      className="
                        flex items-center gap-2
                        px-4 py-2
                        border border-zinc-200
                        hover:border-black
                        hover:bg-black
                        hover:text-white
                        transition
                        text-xs md:text-sm cursor-pointer
                      "
                    >
                      <IoTimeOutline className="text-sm" />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========================= */}
            {/* POPULAR SEARCHES */}
            {/* ========================= */}
            {!query && popularSearches.length > 0 && (
              <div>
                <p className="text-zinc-400 text-xs tracking-[0.2em] uppercase mb-4">
                  Popular Searches
                </p>

                <div className="flex flex-wrap gap-3 text-black">
                  {popularSearches.map((item, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleSearch(item.name)
                      }
                      className="
                        px-4 py-2
                        border border-zinc-200
                        hover:border-black
                        hover:bg-black
                        hover:text-white
                        transition
                        text-xs md:text-sm
                        uppercase cursor-pointer
                      "
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ========================= */}
            {/* EMPTY */}
            {/* ========================= */}
            {query &&
              suggestions.length === 0 &&
              !loading && (
                <div className="py-10 text-center">
                  <p className="text-sm text-zinc-500">
                    No search results found.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    </>
  );
}