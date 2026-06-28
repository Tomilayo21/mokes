//app\collection\[slug]\page.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import RelatedProducts from "@/components/RelatedProducts";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import toast from "react-hot-toast";
import { Heart, ShoppingCart, ArrowRight, Star, CheckCircle, XCircle, Tag, MessageCircle, ThumbsUp, ArrowLeft } from "lucide-react";
import { FaStar, FaRegStar, FaThumbsUp, FaTag } from "react-icons/fa";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { IoIosArrowForward, IoIosArrowBack } from "react-icons/io";


export default function ProductPage() {
  const { data: session, status } = useSession();
  const { slug } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToCart } = useAppContext();
  const currency = "₦";
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState(null); 
  const [mainImage, setMainImage] = useState(null); 
  const [page, setPage] = useState(1); 
  const [loading, setLoading] = useState(true); 
  const [selectedSize, setSelectedSize] = useState("");
  const scrollRef = useRef(null);
  const thumbRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canScroll, setCanScroll] = useState(false); 
  const [hasOverflow, setHasOverflow] = useState(false); 
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollLeft = () => {
    const el = thumbRef.current;
    if (!el) return;

    el.scrollBy({
      left: -200,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    const el = thumbRef.current;
    if (!el) return;

    el.scrollBy({
      left: 200,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [productRes, listRes] = await Promise.all([
          fetch(`/api/product/${slug}`),
          fetch("/api/product/list"),
        ]);

        if (!productRes.ok) {
          console.log(await productRes.text());
          throw new Error("Product fetch failed");
        }

        const productJson = await productRes.json();
        const listJson = await listRes.json();

        console.log("PRODUCT:", productJson);
        console.log("LIST:", listJson);

        setProductData(
          productJson.product ||
          productJson.data ||
          productJson
        );

        setProducts(
          Array.isArray(listJson)
            ? listJson
            : listJson.products ||
              listJson.data ||
              []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    if (!Array.isArray(products) || products.length === 0) return;

    const product = products.find(
      (p) => p.slug?.toLowerCase() === slug?.toLowerCase()
    );

    if (product) {
      setProductData(product);
    }
  }, [slug, products]);


  // Add to Cart 
  const handleAddToCart = () => {
    if (status !== "authenticated") {
      const query = searchParams.toString();

      const currentUrl = `${pathname}${
        query ? `?${query}` : ""
      }`;

      router.push(
        `/authentication?callbackUrl=${encodeURIComponent(
          currentUrl
        )}`
      );

      return;
    }

    if (!selectedSize) {
      toast.custom(
        (t) => (
          <div
            className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
              t.visible
                ? "animate-toast-bounce opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <p className="flex-1 text-sm font-medium text-red-800">
              Please select a size
            </p>

            {/* Close */}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 cursor-pointer hover:text-black transition"
            >
              ✕
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
              <div
                className="h-full bg-[var(--sage)]"
                style={{
                  animation: `toast-progress ${t.duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        ),
        {
          duration: 4000,
          position: "top-right",
        }
      );
      return;
    }

    addToCart(productData, selectedSize);

    toast.custom(
      (t) => (
        <div
          className={`relative overflow-hidden max-w-md w-full bg-white border border-gray-200 shadow-lg rounded-sm flex items-center gap-4 p-4 transition-all duration-300 ${
            t.visible
              ? "translate-x-0 opacity-100"
              : "translate-x-10 opacity-0"
          }`}
        >
          {/* Product Image */}
          <div className="w-14 h-14 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
            <Image
              src={productData.image?.[0] || "/placeholder.png"}
              alt={productData.name}
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <p className="text-sm font-normal text-black tracking-wide">
              Now in your bag
            </p>

            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {productData.name?.toUpperCase()} in{" "}
              {selectedSize?.toLowerCase()} size has been added to your cart.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-gray-400 cursor-pointer hover:text-black transition"
          >
            ✕
          </button>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gray-100">
            <div
              className="h-full bg-[var(--sage)]"
              style={{
                animation: `toast-progress ${t.duration}ms linear forwards`,
              }}
            />
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-right",
      }
    );
  };

  const relatedProducts = React.useMemo(() => {
    if (!productData || !Array.isArray(products)) return [];

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
        if (
          (p.subcategory || p.subCategory) ===
          (productData.subcategory || productData.subCategory)
        ) {
          score += 2;
        }

        if (p.brand === productData.brand) score += 1;

        const price = Number(String(p.price || 0).replace(/,/g, ""));
        const basePrice = Number(
          String(productData.price || 0).replace(/,/g, "")
        );

        if (
          !isNaN(price) &&
          !isNaN(basePrice) &&
          basePrice > 0 &&
          Math.abs(price - basePrice) / basePrice < 0.2
        ) {
          score += 1;
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

    // scroll tracking
    el.addEventListener("scroll", handle);

    // resize tracking
    const resizeObserver = new ResizeObserver(handle);
    resizeObserver.observe(el);

    // image/layout delay fix
    const timeout = setTimeout(handle, 300);

    return () => {
      el.removeEventListener("scroll", handle);
      resizeObserver.disconnect();
      clearTimeout(timeout);
    };
  }, [relatedProducts]);


  useEffect(() => {
    if (!productData?._id) return;

    const existing = JSON.parse(
      localStorage.getItem("recentlyViewed") || "[]"
    );

    // Remove duplicates
    const filtered = existing.filter(
      (id) => id !== productData._id
    );

    // Add current product to the front
    const updated = [productData._id, ...filtered].slice(0, 20);

    localStorage.setItem(
      "recentlyViewed",
      JSON.stringify(updated)
    );
  }, [productData]);
  
  if (!slug) return null; 

  if (!productData && products.length > 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Product not found
      </div>
    );
  }

  if (!productData) return <Loading type="product" />;

  return (
    <>
      <div className="flex flex-col bg-white mt-8 text-black dark:bg-white dark:text-black min-h-screen text-black dark:bg-white dark:text-black min-h-screen">
        {/* <div className="w-full max-w-7xl mx-auto px-4 md:px-16 lg:px-32"> */}
          <div className="px-4 md:px-16 lg:px-32 space-y-8">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mt-6 md:mt-8 mb-8">
              {/* Left: Product Images */}
              <div>
                <div className="overflow-hidden bg-gray-100 dark:bg-gray-800 mb-6 hover:shadow-md">
                  <Image
                    src={mainImage || productData?.image?.[0] || "/placeholder.png"}
                    alt={productData?.name || "Product image"}
                    width={1280}
                    height={720}
                    className="w-full h-[280px] sm:h-[350px] md:h-[400px] object-cover"
                  />
                </div>

                <div className="relative w-full mt-3 flex items-center gap-4 sm:gap-0">

                  {/* LEFT ARROW */}
                  {productData?.image?.length > 4 && (
                    <button
                      onClick={scrollLeft}
                      className="sm:hidden flex-shrink-0 text-black dark:text-black hover:scale-110 transition px-2"
                    >
                      <IoIosArrowBack size={20} />
                    </button>
                  )}

                  {/* THUMBNAILS */}
                  <div className="relative flex-1 overflow-hidden">
                    <div
                      ref={thumbRef}
                      className={`flex gap-3 overflow-x-auto sm:overflow-visible sm:flex-wrap scroll-smooth scrollbar-hide snap-x snap-mandatory
                      ${(productData?.image?.length || 0) > 4 ? "px-2 sm:px-0" : "px-0"}`}
                    >
                      {productData?.image?.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setMainImage(img);
                            setActiveIndex(i);
                          }}
                          className={`flex-shrink-0 w-[85px] sm:w-[95px] md:w-[110px] cursor-pointer transition
                            ${activeIndex === i ? "ring-2 ring-black dark:ring-white scale-105" : "opacity-70"}
                          `}
                        >
                          <Image
                            src={img}
                            alt={`${productData?.name || "Product"} thumbnail ${i + 1}`}
                            width={150}
                            height={150}
                            className="w-full h-20 sm:h-24 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT ARROW */}
                  {productData?.image?.length > 4 && (
                    <button
                      onClick={scrollRight}
                      className="sm:hidden flex-shrink-0 text-black dark:text-black hover:scale-110 transition px-2"
                    >
                      <IoIosArrowForward size={20} />
                    </button>
                  )}

                </div>
              </div>

              {/* Right: Product Info */}
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-light leading-snug text-black dark:text-black mb-2">
                  {productData.brand?.toUpperCase()} |{" "}
                  {productData.name} |{" "}
                  {productData.color}
                </h1>

                {/* Price */}
                <div className="flex items-center gap-3 mb-6">
                  {/* === Discounted Price === */}
                  <span className="text-md font-normal text-gray-600 flex items-center gap-1">
                    {currency}
                    {Number(productData.offerPrice).toLocaleString()}
                  </span>

                  {/* === Original Price (Strikethrough) === */}
                  <span className="line-through text-sm text-gray-500 dark:text-gray-400">
                    {currency}
                    {Number(productData.price).toLocaleString()}
                  </span>

                  {/* === Percentage Off === */}
                  {/* {productData.price > productData.offerPrice && (
                    <span className="bg-black text-white text-xs font-medium px-2.5 py-1 rounded-full tracking-wide">
                      SAVE{" "}
                      {Math.round(
                        ((productData.price - productData.offerPrice) / productData.price) * 100
                      )}
                      %
                    </span>
                  )} */}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-3 mt-6 md:mt-16 mb-6 w-full">
                  <div className="w-full mb-4">
                    <p className="text-sm font-medium mb-2 text-gray-700">
                      Select Size
                    </p>

                    <div className="grid grid-cols-4 gap-2">
                      {productData.sizes?.map((item) => {
                        const isOutOfStock = item.stock === 0;

                        return (
                          <div key={item.size} className="relative group">
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => {
                                if (!isOutOfStock) setSelectedSize(item.size);
                              }}
                              className={`w-full py-3 border text-sm transition rounded-md
                                ${
                                  selectedSize === item.size
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-700 border-gray-300"
                                }
                                ${isOutOfStock ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                              `}
                            >
                              {item.size}
                            </button>

                            {/* Tooltip */}
                            {isOutOfStock && (
                              <div className="absolute left-1/2 -translate-x-1/2 -top-8 hidden group-hover:block bg-black text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                Out of stock
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={handleAddToCart}
                    disabled={productData.stock === 0}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[var(--sage)] cursor-pointer text-white shadow hover:bg-gray-50 hover:text-gray-700 transition disabled:opacity-50"
                  >
                    {productData.stock === 0 ? "Sold Out" : "Add to Cart"}
                  </button>

                  <Link
                    href="/cart"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-500 text-sm hover:text-black  transition"
                  >
                    Go to Cart
                    <ArrowRight size={18} />
                  </Link>

                </div>

              {/* Description */}
                <div
                  className="text-gray-700 font-normal dark:text-gray-700 leading-relaxed mb-4"
                  dangerouslySetInnerHTML={{ __html: productData.description }}
                />

              </div>
            </div>


            {/* Related Products */}
            {relatedProducts.length > 0 && (
              <section className="mt-12 md:mt-16">

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
        {/* </div> */}
      </div>
      <Footer />
    </>
  );
}
