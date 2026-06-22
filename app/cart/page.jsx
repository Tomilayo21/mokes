"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { ShoppingCart, PackageX } from "lucide-react";
import OrderSummary from "@/components/OrderSummary";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import { useRouter } from 'next/navigation';
import { IoIosArrowRoundBack } from "react-icons/io";
import RelatedProducts from "@/components/RelatedProducts";

const Cart = () => {
  const router = useRouter();

  const {
    cartItems,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  } = useAppContext();


  const currency = "₦";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const thumbRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false); 
  const [hasOverflow, setHasOverflow] = useState(false); 
  const [recentlyViewedIds, setRecentlyViewedIds] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product/list");
        const data = await res.json();

        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);  

  useEffect(() => {
    const viewed = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );

    setRecentlyViewedIds(viewed);
  }, []);

  useEffect(() => {
    // small delay to wait for context to hydrate
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [cartItems]);

  const cartCount = getCartCount();

  const subtotal = React.useMemo(() => {
    let total = 0;

    if (!products.length) return 0;

    for (const itemId in cartItems) {
      const product = products.find((p) => p._id === itemId);
      if (!product) continue;

      for (const size in cartItems[itemId]) {
        total += (Number(product.offerPrice) || 0) * cartItems[itemId][size];
      }
    }

    return Math.round(total * 100) / 100;
  }, [cartItems, products]);
  
  const toTitleCase = (str = "") => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const relatedProducts = React.useMemo(() => {
    if (!products?.length) return [];

    const cartProductIds = Object.keys(cartItems);

    const viewedProducts = recentlyViewedIds
      .map((id) => products.find((p) => p._id === id))
      .filter(Boolean);

    // Build recommendations first
    const recommendations = products
      .filter(
        (p) =>
          !cartProductIds.includes(p._id) &&
          !recentlyViewedIds.includes(p._id) &&
          p.visible !== false
      )
      .map((p) => {
        let score = 0;

        viewedProducts.forEach((viewed) => {
          if (p.category === viewed.category) score += 3;
          if (p.subcategory === viewed.subcategory) score += 2;
          if (p.brand === viewed.brand) score += 1;

          const price = Number(
            String(p.offerPrice || p.price).replace(/,/g, "")
          );

          const viewedPrice = Number(
            String(viewed.offerPrice || viewed.price).replace(/,/g, "")
          );

          if (
            !isNaN(price) &&
            !isNaN(viewedPrice) &&
            viewedPrice > 0
          ) {
            if (
              Math.abs(price - viewedPrice) / viewedPrice < 0.2
            ) {
              score += 1;
            }
          }
        });

        return { ...p, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // Fallback: newest products if no good matches
    if (recommendations.length === 0) {
      return products
        .filter(
          (p) =>
            !cartProductIds.includes(p._id) &&
            p.visible !== false
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        )
        .slice(0, 8);
    }

    return recommendations;
  }, [products, cartItems, recentlyViewedIds]);

  const updateScrollProgress = () => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;

    if (maxScroll <= 0) {
      setHasOverflow(false);
      setScrollProgress(0);
      return;
    }

    setHasOverflow(true);

    const progress = (el.scrollLeft / maxScroll) * 100;
    setScrollProgress(progress);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handle = () => updateScrollProgress();

    el.addEventListener("scroll", handle, { passive: true });

    const resizeObserver = new ResizeObserver(handle);
    resizeObserver.observe(el);

    const timeout = setTimeout(handle, 300);

    return () => {
      el.removeEventListener("scroll", handle);
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [relatedProducts]);


  return (
    <>
      <Navbar />
      <div className="px-8 md:px-8 lg:px-8 pt-10 lg:px-8 py-16 mt-8 mb-20">
        {/* Header */}
        <div className="relative mb-8 pb-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
              Shopping Bag
            </h2>

            <p className="text-sm md:text-base text-gray-500 mt-2">
              Review the items you've added before checking out.
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-lg text-gray-600 animate-pulse">
              Bag is loading...
            </p>
          </div>
        ) : cartCount === 0 ? (
          /* Empty Cart */
          <div className="flex flex-col items-center justify-center py-12">
            <img src="/Essential_illustrations_-removebg-preview.png" width={200} height={200} alt="Empty Cart" />
            <p className="mt-6 text-lg text-gray-600">
              Looks like your bag is empty. Let’s fill it up!
            </p>
            <button
              onClick={() => router.push("/collections/all")}
              className="mt-6 cursor-pointer bg-[var(--sage)] text-white 
              hover:bg-zinc-500 transition uppercase
              px-6 py-3 rounded-sm shadow-md transition"
            >
              Browse Products
            </button>
          </div>
        ) : (
          /* Cart Items + Order Summary */
          <div className="flex flex-col md:flex-row gap-10">
            {/* Cart Items */}
            <div className="flex-1 relative">

              <div className="space-y-6 px-4">
                <div className="overflow-x-auto">
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full table-fixed border-collapse">
                      <thead className="border-b border-gray-300">
                        <tr className="text-left text-sm uppercase tracking-wide text-gray-500">
                          
                          {!loading && cartCount > 0 && (
                            <th className="py-4 font-medium">
                            {cartCount === 1 ? "Product" : "Products"}
                          </th>

                          )}
                          <th className="py-4 font-medium text-center">Price</th>
                          <th className="py-4 font-medium text-center">Quantity</th>
                          <th className="py-4 font-medium text-right">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {Object.keys(cartItems).flatMap((itemId) => {
                          const product = products.find((p) => p._id === itemId);
                          if (!product) return [];

                          return Object.entries(cartItems[itemId]).map(
                            ([size, quantity]) => {
                              const sizeData = product?.sizes?.find(
                                (s) =>
                                  String(s.size).toLowerCase() ===
                                  String(size).toLowerCase()
                              );

                              const sizeStock = Number(sizeData?.stock ?? 0);
                              const isSoldOut = sizeStock === 0;

                              return (
                                <tr
                                  key={`${itemId}-${size}`}
                                  className="border-b border-gray-200 align-top"
                                >
                                  {/* PRODUCT */}
                                  <td className="py-6">
                                    <div className="flex gap-4 min-w-0">
                                      <img
                                        src={product.image?.[0]}
                                        alt={product.name}
                                        className="w-20 h-24 flex-shrink-0 object-cover bg-gray-50"
                                      />

                                      <div>
                                        <h3 className="text-sm md:text-base font-medium text-black">
                                          {product.brand?.toUpperCase()} | {product.name}
                                        </h3>

                                        <p className="text-gray-500 text-sm mt-1">
                                          Color: {product.color}
                                        </p>

                                        <p className="text-gray-500 text-sm">
                                          Size: {size}
                                        </p>

                                        <button
                                          onClick={() =>
                                            updateCartQuantity(product._id, size, 0)
                                          }
                                          className="text-sm mt-3 underline text-gray-600"
                                        >
                                          Remove
                                        </button>

                                        {isSoldOut && (
                                          <p className="text-red-500 mt-2 text-sm">
                                            Sold Out
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </td>

                                  {/* PRICE */}
                                  <td className="text-center text-black py-6">
                                    {currency}
                                    {Number(product.offerPrice).toLocaleString()}
                                  </td>

                                  {/* QUANTITY */}
                                  <td className="py-6">
                                    <div className="flex justify-center">
                                      <div className="flex border">
                                        <button
                                          onClick={() =>
                                            updateCartQuantity(
                                              product._id,
                                              size,
                                              quantity - 1
                                            )
                                          }
                                          disabled={quantity <= 1}
                                          className="
                                            px-3 py-1
                                            text-black
                                            font-semibold
                                            transition
                                            disabled:text-gray-400
                                            disabled:bg-gray-100
                                            disabled:cursor-not-allowed
                                          "
                                        >
                                          −
                                        </button>

                                        <input
                                          value={quantity}
                                          readOnly
                                          className="w-12 text-center border-x border-y text-black font-medium"
                                        />

                                      <button
                                        onClick={() => {
                                          if (!isSoldOut && quantity < sizeStock) {
                                            updateCartQuantity(
                                              product._id,
                                              size,
                                              quantity + 1
                                            );
                                          }
                                        }}
                                        disabled={isSoldOut || quantity >= sizeStock}
                                        className="
                                          px-3 py-1
                                          text-black
                                          font-semibold
                                          transition
                                          disabled:text-gray-400
                                          disabled:bg-gray-100
                                          disabled:cursor-not-allowed
                                        "
                                      >
                                        +
                                      </button>
                                      </div>
                                    </div>
                                  </td>

                                  {/* TOTAL */}
                                  <td className="text-right text-black py-6 font-medium">
                                    {currency}
                                    {(
                                      Number(product.offerPrice) * quantity
                                    ).toLocaleString()}
                                  </td>
                                </tr>
                              );
                            }
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS */}
                  <div className="md:hidden space-y-4">
                    {Object.keys(cartItems).flatMap((itemId) => {
                      const product = products.find((p) => p._id === itemId);
                      if (!product) return [];

                      return Object.entries(cartItems[itemId]).map(([size, quantity]) => {
                        const sizeData = product?.sizes?.find(
                          (s) =>
                            String(s.size).toLowerCase() === String(size).toLowerCase()
                        );

                        const sizeStock = Number(sizeData?.stock ?? 0);
                        const isSoldOut = sizeStock === 0;

                        return (
                          <div
                            key={`${itemId}-${size}`}
                            className="border rounded-lg p-4 bg-white hover:shadow-sm"
                          >
                            {/* TOP SECTION */}
                            <div className="flex gap-4">
                              <img
                                src={product.image?.[0]}
                                className="w-20 h-24 object-cover bg-gray-50 flex-shrink-0"
                              />

                              <div className="min-w-0">
                                <h3 className="text-sm font-medium text-black">
                                  {product.brand?.toUpperCase()} | {product.name}
                                </h3>

                                <p className="text-gray-500 text-xs mt-1">
                                  Size: {size}
                                </p>

                                <p className="text-gray-500 text-xs">
                                  Color: {product.color}
                                </p>

                                {isSoldOut && (
                                  <p className="text-red-500 text-xs mt-1">
                                    Sold Out
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* PRICE + TOTAL */}
                            <div className="flex justify-between mt-4 text-sm">
                              <span className="text-gray-600">Price</span>
                              <span className="text-black font-medium">
                                {currency}{Number(product.offerPrice).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex justify-between mt-2 text-sm">
                              <span className="text-gray-600">Total</span>
                              <span className="text-black font-semibold">
                                {currency}
                                {(Number(product.offerPrice) * quantity).toLocaleString()}
                              </span>
                            </div>

                            {/* QUANTITY */}
                            <div className="flex items-center justify-between mt-4">
                              <span className="text-gray-600 text-sm">Qty</span>

                              <div className="flex border rounded">
                                <button
                                  onClick={() =>
                                    updateCartQuantity(product._id, size, quantity - 1)
                                  }
                                  disabled={quantity <= 1}
                                  className="
                                    px-3 py-1
                                    text-black
                                    font-semibold
                                    transition
                                    disabled:text-gray-400
                                    disabled:bg-gray-100
                                    disabled:cursor-not-allowed
                                  "
                                >
                                  −
                                </button>

                                <input
                                  value={quantity}
                                  readOnly
                                  className="w-12 text-center border-x border-y text-black font-medium"
                                />

                                <button
                                  onClick={() => {
                                    if (!isSoldOut && quantity < sizeStock) {
                                      updateCartQuantity(product._id, size, quantity + 1);
                                    }
                                  }}
                                  disabled={isSoldOut || quantity >= sizeStock}
                                  className="
                                    px-3 py-1
                                    text-black
                                    font-semibold
                                    transition
                                    disabled:text-gray-400
                                    disabled:bg-gray-100
                                    disabled:cursor-not-allowed
                                  "
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* REMOVE */}
                            <button
                              onClick={() => updateCartQuantity(product._id, size, 0)}
                              className="mt-4 text-sm text-red-500 underline"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      });
                    })}
                  </div>
                  {/* CART FOOTER */}
                  <div className="mt-8 pt-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">

                      {/* LEFT */}
                      <button
                        onClick={() => router.push("/collections/all")}
                        className="flex items-center gap-2 text-gray-700 hover:text-black transition"
                      >
                        <IoIosArrowRoundBack className="w-5 h-5 text-gray-400" />
                        Continue Shopping
                      </button>

                      {/* RIGHT */}
                      <div className="w-full md:w-[380px] bg-gray-50 p-5 border rounded-sm">
                        
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-700">Subtotal</span>
                          <span className="font-semibold text-black">
                            {currency}
                            {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-4">
                          Tax included and shipping calculated at checkout
                        </p>

                        <button
                          onClick={() => router.push("/checkout")}
                          className="w-full bg-black hover:bg-neutral-900 cursor-pointer text-white py-3 text-sm uppercase tracking-wide hover:opacity-90 transition"
                        >
                          Proceed to Checkout
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
<OrderSummary/>
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-8 px-4 md:mt-12">

            {/* Title */}
            <div className="mb-6 text-center">
              <h2 className="text-xl uppercase md:text-2xl font-normal text-gray-900 dark:text-gray-900">
                you may like
              </h2>
            </div>

            {/* SCROLL CONTAINER (ALWAYS FLEX — NO GRID EVER) */}
            <div className="px-4 md:px-0 overflow-hidden">

              <div
                ref={scrollRef}
                onScroll={updateScrollProgress}
                className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory pb-4"
              >
                {relatedProducts.map((p) => (
                  <div
                    key={p._id}
                    className="flex-none w-[150px] sm:w-[200px] md:w-[240px] snap-start"
                  >
                    <RelatedProducts product={p} />
                  </div>
                ))}
              </div>
            </div>

            {/* PROGRESS BAR (ONLY IF OVERFLOW EXISTS) */}
            {hasOverflow && (
              <div className="w-full h-[2px] bg-gray-200 dark:bg-gray-800 mt-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-150"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            )}

          </section>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Cart;