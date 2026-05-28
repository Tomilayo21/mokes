"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, PackageX } from "lucide-react";
// import OrderSummary from "@/components/OrderSummary";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import { useRouter } from 'next/navigation';
import { IoIosArrowRoundBack } from "react-icons/io";
import RelatedProducts from "@/components/RelatedProducts";

const Cart = () => {
  const router = useRouter();

  const {
    products,
    cartItems,
    updateCartQuantity,
    getCartCount,
    currency,
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const thumbRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false); 
  const [hasOverflow, setHasOverflow] = useState(false); 
  const [productData, setProductData] = useState(null); 
  

  useEffect(() => {
    // small delay to wait for context to hydrate
    const timer = setTimeout(() => {
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [cartItems]);

  const cartCount = getCartCount();
  
  const toTitleCase = (str = "") => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const relatedProducts = React.useMemo(() => {
      if (!productData) return [];
  
      return products
      .filter( 
        (p) => 
        p._id !== productData._id && 
        p.slug !== productData.slug && 
        p.visible !== false 
        )
      .map((p) => {
        let score = 0;
  
        if (p.category === productData.category) score += 3;
        if (p.subcategory === productData.subcategory) score += 2;
        if (p.brand === productData.brand) score += 1;
  
        const price = Number(String(p.price).replace(/,/g, ""));
        const basePrice = Number(String(productData.price).replace(/,/g, ""));
  
        if (!isNaN(price) && !isNaN(basePrice)) {
          if (Math.abs(price - basePrice) / basePrice < 0.2) {
            score += 1;
          }
        }
  
        return { ...p, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    }, [products, productData]);
  
    useEffect(() => {
      const el = scrollRef.current;
      if (!el || !productData) return;
  
      const check = () => {
        const overflow = el.scrollWidth > el.clientWidth;
  
        // only enable scroll when items actually overflow
        setCanScroll(overflow && relatedProducts.length > 2);
      };
  
      check();
  
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, [relatedProducts, productData]);
  
    const checkOverflow = () => {
      const el = scrollRef.current;
      if (!el) return;
  
      const hasOverflow = el.scrollWidth > el.clientWidth;
  
      setHasOverflow(hasOverflow);
  
      const maxScroll = el.scrollWidth - el.clientWidth;
  
      const progress =
        maxScroll > 0
          ? (el.scrollLeft / maxScroll) * 100
          : 0;
  
      setScrollProgress(progress);
    };
  
    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
  
      const update = () => checkOverflow();
  
      update(); // initial run
  
      const observer = new ResizeObserver(update);
      observer.observe(el);
  
      window.addEventListener("resize", update);
  
      return () => {
        observer.disconnect();
        window.removeEventListener("resize", update);
      };
    }, [relatedProducts]);  
  
    const updateScroll = () => {
      checkOverflow();
    };


  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-10 mt-8 mb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 border-b border-gray-200 pb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-normal text-gray-900 tracking-tight">
             Shopping Bag
            </h2>
            <p className="text-sm md:text-base text-gray-500 mt-2">
              Review the items you’ve added before checking out.
            </p>
          </div>

          {!loading && cartCount > 0 && (
            <p className="text-lg md:text-xl font-medium text-gray-700 mt-4 md:mt-0">
              {cartCount} {cartCount === 1 ? "Item" : "Items"}
            </p>
          )}
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
            <div className="flex-1 space-y-6">
              {Object.keys(cartItems).flatMap((itemId) => {
                const product = products.find((p) => p._id === itemId);

                // ✅ prevent crash if product not found
                if (!product) return [];

                return Object.entries(cartItems[itemId]).map(([size, quantity]) => {
                  // ✅ safe size match (case-insensitive)
                  const sizeData = product?.sizes?.find(
                    (s) =>
                      String(s.size).toLowerCase() === String(size).toLowerCase()
                  );

                  // ✅ final stock value (ONLY rely on size stock)
                  const sizeStock = Number(sizeData?.stock ?? 0);

                  const currentQuantity = quantity;
                  const isSoldOut = sizeStock === 0;

                  return (
                    <div
                      key={`${itemId}-${size}`}
                      className="flex flex-col md:flex-row items-center gap-6 bg-white p-4 border-b border-gray-200 last:border-b-0"
                    >
                      {/* IMAGE */}
                      <div className="flex-shrink-0">
                        <img
                          src={product.image?.[0]}
                          alt={product.name}
                          className="w-28 h-28 object-contain bg-gray-50 p-2"
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="flex flex-1 flex-col md:flex-row justify-between items-start md:items-center w-full">
                        <div>
                          <h3 className="text-lg md:text-xl font-light text-gray-800">
                            {product.brand?.toUpperCase()} | {product.name} | {product.color}
                          </h3>

                          <p className="text-gray-500 mt-1">
                            {currency}
                            {Number(product.offerPrice).toLocaleString()}
                          </p>

                          <p className="text-sm text-gray-500">Size: {size}</p>

                          <button
                            onClick={() =>
                              updateCartQuantity(product._id, size, 0)
                            }
                            className="text-sm text-[var(--sage)] mt-2 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>

                        {/* CONTROLS */}
                        <div className="flex flex-col gap-2 mt-4 md:mt-0">

                          {/* SOLD OUT LABEL */}
                          {isSoldOut && (
                            <p className="text-red-500 font-normal">
                              Sold Out
                            </p>
                          )}

                          {/* CONTROLS ALWAYS SHOWN (but disabled logically if needed) */}
                          <div className="flex items-center gap-2">

                            {/* MINUS (always allowed) */}
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  product._id,
                                  size,
                                  currentQuantity - 1
                                )
                              }
                              disabled={currentQuantity <= 1}
                              className="px-3 py-1 border text-black rounded-sm hover:bg-gray-100 disabled:opacity-50"
                            >
                              −
                            </button>

                            {/* INPUT */}
                            <input
                              type="number"
                              value={currentQuantity}
                              onChange={(e) => {
                                const value = Number(e.target.value);

                                if (value > 0) {
                                  updateCartQuantity(product._id, size, value);
                                }
                              }}
                              className="w-12 border text-center text-black rounded-sm"
                            />

                            {/* PLUS (blocked if sold out OR reached stock) */}
                            <button
                              onClick={() => {
                                if (!isSoldOut && currentQuantity < sizeStock) {
                                  updateCartQuantity(
                                    product._id,
                                    size,
                                    currentQuantity + 1
                                  );
                                }
                              }}
                              disabled={isSoldOut || currentQuantity >= sizeStock}
                              className="px-3 py-1 border text-black rounded-sm hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          {/* PRICE */}
                          <p className="text-lg font-medium text-gray-800">
                            {currency}
                            {(product.offerPrice * currentQuantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                });
              })}

              <button
                 onClick={() => router.push("/collections/all")}
                className="group flex items-center gap-2 text-gray-800 hover:underline mt-4 cursor-pointer"
              >
                <IoIosArrowRoundBack className="w-6 h-6 text-gray-300 origin-left transition-all duration-300 group-hover:scale-x-125 group-hover:translate-x-1" />
                Continue Shopping
              </button>
            </div>

            {/* Order Summary */}
            {/* <OrderSummary /> */}
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-8 md:mt-12">

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
                onScroll={updateScroll}
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
