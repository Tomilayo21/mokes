"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
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
  const userId = session?.user?.id;
  const { id } = useParams();
  const router = useRouter();
  const { products, addToCart, currency } = useAppContext();
  const [productData, setProductData] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const scrollRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const thumbRef = useRef(null);
  const [showProgress, setShowProgress] = useState(false);
  

  // Load product data and initial like state...

  useEffect(() => {
    if (!id || !products.length) return;

    const product = products.find((p) => p.slug === id);
    if (product) {
      setProductData(product);
    }
  }, [id, products]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const progress =
      (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100;

    setScrollProgress(progress);
  };

  const scrollLeft = () => {
    if (thumbRef.current) {
      thumbRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (thumbRef.current) {
      thumbRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Add to Cart
  const handleAddToCart = () => {
    if (status !== "authenticated") return router.push("/signup");
    addToCart(productData);
  };

  const checkOverflow = () => {
    const el = scrollRef.current;
    if (!el) return;

    setShowProgress(el.scrollWidth > el.clientWidth);
  };

  const relatedProducts = React.useMemo(() => {
    if (!productData) return [];

    return products
      .filter((p) => p._id !== id && p.visible !== false)
      .map((p) => {
        let score = 0;

        // category match (strongest)
        if (p.category === productData.category) score += 3;

        // subcategory match
        if (p.subcategory === productData.subcategory) score += 2;

        // brand match
        if (p.brand === productData.brand) score += 1;

        // price similarity 
        const price = Number(String(p.price).replace(/,/g, ""));
        const basePrice = Number(String(productData.price).replace(/,/g, ""));

        if (!isNaN(price) && !isNaN(basePrice) && basePrice > 0) {
          if (Math.abs(price - basePrice) / basePrice < 0.2) {
            score += 1;
          }
        }

        return { ...p, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [products, productData, id]);
  
  useEffect(() => {
    checkOverflow();

    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [relatedProducts]);

  const canScroll = relatedProducts.length > 1 && scrollProgress > 0;

  if (!productData) return <Loading />;

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
                    src={mainImage || productData.image[0]}
                    alt={productData.name}
                    width={1280}
                    height={720}
                    className="w-full h-[280px] sm:h-[350px] md:h-[400px] object-cover"
                  />
                </div>

                <div className="relative w-full mt-3 flex items-center gap-4">
                  
                  {/* LEFT ARROW (OUTSIDE) */}
                  {productData.image.length > 4 && (
                    <button
                      onClick={scrollLeft}
                      className="flex-shrink-0 text-black dark:text-black
                      hover:scale-110 transition bg-transparent px-2"
                    >
                      <IoIosArrowBack size={20} />
                    </button>
                  )}

                  {/* CAROUSEL CENTER */}
                  <div className="relative flex-1 overflow-hidden">
                    
                    {/* THUMBNAILS */}
                    <div
                      ref={thumbRef}
                      className={`flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory px-4 
                        pl-2 sm:pl-4`}
                    >
                      {productData.image.map((img, i) => (
                        <div
                          key={i}
                          onClick={() => setMainImage(img)}
                          className="min-w-[85px] sm:min-w-[95px] md:min-w-[110px]
                          cursor-pointer transition hover:opacity-80"
                        >
                          <Image
                            src={img}
                            alt={productData.name}
                            width={150}
                            height={150}
                            className="w-full h-20 sm:h-24 object-cover border border-gray-200 dark:border-gray-700"
                          />
                        </div>
                      ))}
                    </div>

                  </div>

                  {/* RIGHT ARROW (OUTSIDE) */}
                  {productData.image.length > 4 && (
                    <button
                      onClick={scrollRight}
                      className="flex-shrink-0 text-black dark:text-black
                      hover:scale-110 transition bg-transparent px-2"
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

                  {productData.stock > 0 && (
                  <Link
                    href="/cart"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-500 text-sm hover:text-black  transition"
                  >
                    Go to Cart
                    <ArrowRight size={18} />
                  </Link>
                  )}
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
              <section className="mt-8 md:mt-12">
                
                {/* Centered title */}
                <div className="mb-6 text-center">
                  <h2 className="text-xl uppercase md:text-2xl font-normal text-gray-900 dark:text-gray-900">
                    you may like
                  </h2>
                </div>

                {/* Carousel */}
                <div className="px-4 md:px-0 overflow-hidden">
                  <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4"
                  >
                    {relatedProducts.map((p) => (
                      <div
                        key={p._id}
                        className="min-w-[150px] sm:min-w-[200px] md:min-w-[240px] snap-start transition-transform hover:scale-[1.03]"
                      >
                        <RelatedProducts product={p} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full h-[2px] bg-gray-200 dark:bg-gray-800 mt-2 relative rounded-full overflow-hidden">
                {canScroll && (
                  <div className="w-full h-[2px] bg-gray-200 dark:bg-gray-800 mt-2 relative rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black dark:bg-white transition-all duration-150"
                      style={{ width: `${scrollProgress}%` }}
                    />
                  </div>
                )}
                </div>
              </section>
            )}
          </div>
        {/* </div> */}
      </div>
      <Footer />
    </>
  );
}
