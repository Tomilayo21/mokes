"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TiptapEditor from "@/components/TiptapEditor";
import { CheckCircle, AlertCircle, Search } from "lucide-react";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";

const PRODUCTS_PER_PAGE = 25;

const ProductListPanel = () => {
  const { router, getToken, user, currency } = useAppContext();
  const { data: session, status } = useSession();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockInputs, setStockInputs] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const parsedStart = startDate ? new Date(startDate) : null;
  const parsedEnd = endDate ? new Date(endDate) : null;
  const [openProduct, setOpenProduct] = useState(null);
  const [editableProduct, setEditableProduct] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [expandedStockId, setExpandedStockId] = useState(null);
  const [stockPreview, setStockPreview] = useState(null);
  
  const isAdmin = session?.user?.role === 'admin';
  

  
  dayjs.extend(relativeTime);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);
 
  useEffect(() => {
    if (openProduct) {
      setEditableProduct({ ...openProduct });
    }
  }, [openProduct]);

  // Set end of day for the end date so the filter includes the whole day
  if (parsedEnd) {
    parsedEnd.setHours(23, 59, 59, 999);
  }
  
  useEffect(() => {
    if (status === 'authenticated' && !isAdmin) {
      router.replace('/'); 
    }
  }, [status, isAdmin, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !isAdmin) return;
    fetchAdminProduct();
  }, [status, isAdmin]);

  const fetchAdminProduct = async () => {
    try {
      const { data } = await axios.get("/api/product/admin-list");

      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
        setLoading(false);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Fetch admin product error:", error);
      if (error.response?.status === 401) {
        toast.error("You must be logged in as an admin");
      } else if (error.response?.status === 403) {
        toast.error("Access denied — admin only");
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  };

  useEffect(() => {
  let temp = [...products];

  if (searchTerm) {
    temp = temp.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (selectedCategory !== "All") {
    temp = temp.filter((p) => p.category === selectedCategory);
  }

  // Date range filtering
  temp = temp.filter((p) => {
    const created = new Date(p.date); // use the correct date field from your schema
    return (
      (!parsedStart || created >= parsedStart) &&
      (!parsedEnd || created <= parsedEnd)
    );
  });

  // Sorting
  if (sortOption === "price-asc") {
    temp.sort((a, b) => a.offerPrice - b.offerPrice);
    } else if (sortOption === "price-desc") {
      temp.sort((a, b) => b.offerPrice - a.offerPrice);
    } else if (sortOption === "stock-asc") {
      temp.sort((a, b) => a.stock - b.stock);
    } else if (sortOption === "stock-desc") {
      temp.sort((a, b) => b.stock - a.stock);
    }
    setFilteredProducts(temp);
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, products, sortOption, startDate, endDate]);


  const handleExportCSV = () => {
    const headers = ["Name", "Category", "Price", "Stock", "Created At"];
    const rows = filteredProducts.map((p) => [
      p.name,
      p.category,
      p.offerPrice,
      p.stock,
      new Date(p.createdAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "products.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (user) fetchAdminProduct();
  }, [user]);

  useEffect(() => {
    let temp = [...products];

    if (searchTerm) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      temp = temp.filter((p) => p.category === selectedCategory);
    }

    setFilteredProducts(temp);
    setCurrentPage(1); // Reset to first page on filter/search change
  }, [searchTerm, selectedCategory, products]);

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { data } = await axios.delete(`/api/product/${productId}`);

      if (data.success) {
        toast.success("Product deleted");

        setProducts(prev =>
          prev.filter(p => p._id !== productId)
        );

        setFilteredProducts(prev =>
          prev.filter(p => p._id !== productId)
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const toggleVisibility = async (id) => {
    try {
      const token = session?.accessToken;

      const { data } = await axios.patch(
        `/api/product/${id}`,
        { toggleVisibility: true },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            userid: session?.user?.id,
          },
        }
      );
      if (data.success) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              } max-w-md w-full bg-gray-50 dark:bg-gray-800 shadow-sm rounded-sm pointer-events-auto flex items-center gap-3 p-4 transition-all`}
            >
              <p className="text-sm font-light tracking-wide text-gray-800 dark:text-gray-100">
                Visibility updated successfully
              </p>
            </div>
          ),
          { duration: 3000, position: "top-right" }
        );

        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, visible: data.visible } : p
          )
        );
      } else {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-10 opacity-0"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
            >
              <p className="text-sm font-medium text-red-600 dark:text-red-300">
                {data.message || "Something went wrong"}
              </p>
            </div>
          ),
          { duration: 3000, position: "top-right" }
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleProductUpdate = async (product) => {
    try {
      setIsUpdating(true);
      const formData = new FormData();

      formData.append("name", product.name);
      formData.append("category", product.category);
      formData.append("brand", product.brand);
      formData.append("color", product.color);
      formData.append("price", product.price);
      formData.append("offerPrice", product.offerPrice);
      formData.append("visible", product.visible);
      formData.append("description", product.description);
      formData.append("subcategory", product.subcategory);
      formData.append(
        "sizes",
        JSON.stringify(product.sizes)
      );
      formData.append("existingImages", JSON.stringify(product.image || []));

      if (product.newImages && product.newImages.length > 0) {
        for (let i = 0; i < product.newImages.length; i++) {
          formData.append("newImages", product.newImages[i]);
        }
      }


      const res = await fetch(`/api/product/${product._id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.err || data.message || "Update failed");
      }

      // 🎉 Confetti burst for premium effect
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });

      // ✅ Custom Success Toast
      toast.custom(
        (t) => (
          <div
            className={`
              max-w-md w-full bg-gray-50 dark:bg-gray-50 shadow-sm rounded-sm pointer-events-auto flex items-center gap-3 p-4
              transform transition-all duration-300 ease-in-out
              ${t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
            `}
          >
            <p className="text-sm font-light tracking-wide text-gray-800 dark:text-gray-800">
              Product updated successfully!
            </p>
          </div>
        ),
        { duration: 2500, position: "top-right" }
      );

      setOpenProduct(null);
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, ...product } : p
        )
      );
    } catch (err) {
      console.error(err);

      // ❌ Custom Error Toast
      toast.custom(
        (t) => (
          <div
            className={`
              max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4
              transform transition-all duration-300 ease-in-out
              ${t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
            `}
          >
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Update failed. Please try again.
            </p>
          </div>
        ),
        { duration: 2500, position: "top-right" }
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAdmin) return <p className="p-8 text-center text-red-500">Access denied. You are not an admin.</p>;

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const subcategoryMap = {
    Male: [
      "linen",
      "cotton",
      "watch",
      "tees",
      "sweaters",
      "jackets",
      "pants",
      "accessories",
    ],

    Female: [
      "linen",
      "cotton",
      "watch",
      "tees",
      "sweaters",
      "jackets",
      "pants",
      "accessories",
    ],

    "homegifts": [
      "kitchen",
      "dining",
      "bedroom",
      "bathroom",
      "home-decor",
      "wall-art",
      "candles",
      "vases",
      "storage",
      "gift-sets",
      "personalized-gifts",
      "seasonal-gifts",
    ],
  };

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">

      <div className="w-full md:p-10 p-4 max-w-7xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl tracking-wide uppercase font-normal text-gray-900">
            All Products
          </h1>
          <button
            onClick={handleExportCSV}
            className="bg-[var(--sage)] hover:bg-gray-600 text-white px-4 py-2 rounded-sm cursor-pointer flex items-center gap-2 text-sm shadow-sm transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
            </svg>
            Export CSV
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white border border-gray-200 p-4 flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative w-full sm:w-48">
            {/* Search Icon */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border px-3 text-black py-2 text-sm w-full border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-3 py-2 rounded-sm text-black text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Sort Options */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-2 rounded-sm text-black text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
          >
            <option value="none">Sort</option>
            <option value="price-asc">Price Low → High</option>
            <option value="price-desc">Price High → Low</option>
            <option value="stock-asc">Stock Low → High</option>
            <option value="stock-desc">Stock High → Low</option>
          </select>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-sm text-black text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600 uppercase">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-sm text-black text-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
            />
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white overflow-x-auto">
            <table className="table-fixed w-full border-collapse">
              <thead className="bg-gray-50 text-gray-800 text-sm sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-medium text-left">Product</th>
                  <th className="px-4 py-3 font-medium text-left">Category</th>
                  <th className="px-4 py-3 font-medium text-left">Price</th>
                  <th className="px-4 py-3 font-medium text-left">Stock</th>
                  <th className="px-4 py-3 font-medium text-left">Visibility</th>
                  <th className="px-4 py-3 font-medium text-left">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {paginatedProducts.map((product, index) => (
                  <tr
                    key={product._id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-zinc-50"
                    } border-t border-gray-200 hover:bg-gray-50 transition cursor-pointer`}
                  >
                    {/* Product */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center space-y-2">
                        <Image
                          src={product.image[0]}
                          alt="product image"
                          className="w-14 h-14 object-cover rounded-sm border shadow-sm"
                          width={56}
                          height={56}
                        />
                        <span className="font-medium text-center text-sm break-words">
                          {product.name}
                        </span>
                        {/* <span className="truncate font-medium text-center text-sm w-full">
                          {product.name}
                        </span> */}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 ">{product.category}</td>
                    <td className="px-4 py-3 font-normal text-gray-800">
                      {currency}
                      {Number(product.offerPrice).toLocaleString()}
                    </td>

                    {/*Sizes & Stock*/}
                    <td className="px-4 py-3 ">
                      <button
                        onClick={() =>
                          setStockPreview(
                            stockPreview?._id === product._id ? null : product
                          )
                        }
                        className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium bg-gray-100 rounded-md hover:bg-gray-200 transition"
                      >
                        <span>
                          {product.sizes?.reduce(
                            (sum, size) => sum + Number(size.stock || 0),
                            0
                          )}
                        </span>
                        <span className="text-xs text-gray-500">units</span>
                      </button>
                    </td>

                    {/* Visibility */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleVisibility(product._id)}
                        className={`px-3 py-1.5 rounded-md text-white text-xs font-medium transition ${
                          product.visible ? "bg-[var(--sage)] hover:bg-zinc-500" : "bg-gray-400 hover:bg-gray-500"
                        }`}
                      >
                        {product.visible ? "Visible" : "Hidden"}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 flex flex-col gap-2">
                      <button
                        onClick={() => setOpenProduct(product)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs flex items-center gap-1 justify-center transition"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => setViewProduct(product)}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs flex items-center gap-1 justify-center transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs flex items-center gap-1 justify-center transition"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-4">
            {paginatedProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white border border-gray-200 rounded-sm p-4 flex gap-4 hover:shadow-md transition"
              >
                <Image
                  src={product.image[0]}
                  alt="product image"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-sm border"
                />

                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-base truncate text-gray-800">{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.category}</p>
                  <p className="text-sm font-normal text-gray-800">              
                    {currency}
                    {Number(product.offerPrice).toLocaleString()}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setStockPreview(product)}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                    >
                      <span className="text-xs font-semibold text-gray-700">
                        Stock
                      </span>

                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          product.sizes?.reduce(
                            (sum, size) => sum + Number(size.stock || 0),
                            0
                          ) <= 3
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {product.sizes?.reduce(
                          (sum, size) => sum + Number(size.stock || 0),
                          0
                        )}
                      </span>
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setOpenProduct(product)}
                      className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-xs flex items-center gap-1 transition"
                    >
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                    <button
                      onClick={() => setViewProduct(product)}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs flex items-center gap-1 transition"
                    >
                      View
                    </button>
                    <button
                      onClick={() => toggleVisibility(product._id)}
                      className={`px-3 py-1.5 text-xs rounded-md text-white transition ${
                        product.visible ? "bg-[var(--sage)] hover:bg-zinc-500" : "bg-gray-400 hover:bg-gray-500"
                      }`}
                    >
                      {product.visible ? "Visible" : "Hidden"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>  
          {stockPreview && (
            <>
              {/* backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setStockPreview(null)}
              />

              {/* popup */}
              <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-white border shadow-xl rounded-lg p-4">
                
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-normal text-gray-700">
                    {stockPreview.name}
                  </h3>

                  <button
                    onClick={() => setStockPreview(null)}
                    className="text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-gray-900 mb-2">
                  SIZE BREAKDOWN
                </p>

                <div className="space-y-2">
                  {stockPreview.sizes?.map((size, i) => {
                    const stock = Number(size.stock || 0);

                    return (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="font-light text-gray-500">{size.size}</span>

                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-normal ${
                            stock === 0
                              ? "bg-red-100 text-red-600"
                              : stock <= 3
                              ? "bg-gray-100 text-gray-700"
                              : "bg-[var(--sage)] text-white"
                          }`}
                        >
                          {stock}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 text-[11px] text-gray-500 border-t pt-2">
                  Total:{" "}
                  {stockPreview.sizes?.reduce(
                    (sum, s) => sum + Number(s.stock || 0),
                    0
                  )}{" "}
                  units
                </div>
              </div>
            </>
          )}
        </div>


        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2 flex-wrap">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border text-gray-600 bg-white shadow-sm 
                        hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed 
                        transition-colors"
            >
              Prev
            </button>

            {/* Numbered Buttons with Ellipsis */}
            {(() => {
              const range = [];
              const start = Math.max(1, currentPage - 2);
              const end = Math.min(totalPages, currentPage + 2);

              if (start > 1) {
                range.push(1);
                if (start > 2) range.push("ellipsis-start");
              }

              for (let i = start; i <= end; i++) {
                range.push(i);
              }

              if (end < totalPages) {
                if (end < totalPages - 1) range.push("ellipsis-end");
                range.push(totalPages);
              }

              return range.map((item, index) =>
                item === "ellipsis-start" || item === "ellipsis-end" ? (
                  <span
                    key={index}
                    className="px-3 py-2 text-gray-400 select-none"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`px-4 py-2 rounded-lg border shadow-sm transition-colors
                      ${
                        currentPage === item
                          ? "bg-orange-600 text-white border-blue-600 shadow-md"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {item}
                  </button>
                )
              );
            })()}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border text-gray-600 bg-white shadow-sm 
                        hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed 
                        transition-colors"
            >
              Next
            </button>
          </div>
        )}


        {/* Modal Pop-Up */}
        {openProduct && editableProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-sm p-6 max-w-2xl w-full relative space-y-6 text-sm max-h-[90vh] overflow-y-auto">

              {/* Close Button */}
              <button
                onClick={() => setOpenProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer transition"
              >
                ✖
              </button>

              {/* Title */}
              <h2 className="text-xl tracking-wide uppercase font-normal text-gray-900 border-b pb-3">
                Edit Product
              </h2>

              {/* Product Info Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editableProduct.name}
                    onChange={(e) =>
                      setEditableProduct({ ...editableProduct, name: e.target.value })
                    }
                    className="w-full text-black px-3 py-2 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editableProduct.category}
                      onChange={(e) =>
                        setEditableProduct({
                          ...editableProduct,
                          category: e.target.value,
                        })
                      }
                      className="w-full text-black px-3 py-2 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
                    >
                      <option value="" disabled>Select Category</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="homegifts">Home and Gifts</option>
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SubCategory
                    </label>
                    <select
                      value={editableProduct.subcategory}
                      onChange={(e) =>
                        setEditableProduct({
                          ...editableProduct,
                          subcategory: e.target.value,
                        })
                      }
                      className="w-full text-black px-3 py-2 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
                    >
                      <option value="" disabled>
                        Select Subcategory
                      </option>

                      {(subcategoryMap[editableProduct.category] || []).map((item) => (
                        <option key={item} value={item}>
                          {item.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <select
                      value={editableProduct.brand}
                      onChange={(e) =>
                        setEditableProduct({ ...editableProduct, brand: e.target.value })
                      }
                      className="w-full text-black px-3 py-2 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
                    >
                      <option value="" disabled>Select Brand</option>
                      <option value="Nike">Nike</option>
                      <option value="Adidas">Adidas</option>
                      <option value="Reebok">Reebok</option>
                      <option value="Puma">Puma</option>
                      <option value="Converse">Converse</option>
                      <option value="Reebok">Reebok</option>
                      <option value="Uniqlo">Uniqlo</option>
                      <option value="H&M">H&M</option>
                      <option value="Zara">Zara</option>
                      <option value="Supreme">Supreme</option>
                      <option value="Carhartt-WIP">Carhartt WIP</option>
                      <option value="The-North-Face">The North Face</option>
                      <option value="Vans">Vans</option>
                      <option value="New-Balance">New Balance</option>
                      <option value="Under-Armour">Under Armour</option>
                    </select>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>

                  <input
                    type="text"
                    placeholder="Enter product color"
                    value={editableProduct.color || ""}
                    onChange={(e) =>
                      setEditableProduct({
                        ...editableProduct,
                        color: e.target.value,
                      })
                    }
                    className="w-full text-black px-3 py-2 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-300 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ({currency})</label>
                  <input
                    id="product-price"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full mt-1 placeholder:text-gray-400 text-black py-2.5 px-3 rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                    value={
                      editableProduct.price
                        ? Number(editableProduct.price).toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");

                      if (/^\d*$/.test(rawValue)) {
                        setEditableProduct({
                          ...editableProduct,
                          price: rawValue === "" ? "" : rawValue, // store raw number string
                        });
                      }
                    }}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price ({currency})</label>
                  <input
                    id="product-offer-price"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="w-full mt-1 placeholder:text-gray-400 text-black py-2.5 px-3 rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                    value={
                      editableProduct.offerPrice
                        ? Number(editableProduct.offerPrice).toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, "");

                      if (/^\d*$/.test(rawValue)) {
                        setEditableProduct({
                          ...editableProduct,
                          offerPrice: rawValue === "" ? "" : rawValue,
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Size Inventory
                </label>

                <div className="space-y-3">
                  {editableProduct.sizes?.map((item, index) => (
                    <div
                      key={item.size}
                      className="flex items-center gap-4"
                    >
                      <span className="w-24 text-black">{item.size}</span>

                      <input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(e) => {
                          const updatedSizes = [...editableProduct.sizes];

                          updatedSizes[index] = {
                            ...updatedSizes[index],
                            stock: Number(e.target.value),
                          };

                          setEditableProduct({
                            ...editableProduct,
                            sizes: updatedSizes,
                          });
                        }}
                        className="border text-black px-3 py-2 rounded-sm w-28"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <TiptapEditor
                  description={editableProduct.description}
                  setDescription={(value) =>
                    setEditableProduct({ ...editableProduct, description: value })
                  }
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                <select
                  value={editableProduct.visible ? "visible" : "hidden"}
                  onChange={(e) =>
                    setEditableProduct({
                      ...editableProduct,
                      visible: e.target.value === "visible",
                    })
                  }
                  className="w-full text-black px-3 py-2 border rounded-sm focus:ring-2 focus:ring-[var(--sage)] outline-none"
                >
                  <option value="visible">Visible</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>

              {/* Created Date */}
              {openProduct.date ? (
                <div className="text-xs text-gray-500">
                  Created {new Date(openProduct.date).toLocaleString()} ({dayjs(openProduct.date).fromNow()})
                </div>
              ) : (
                <div className="text-xs text-gray-400">Created date not available</div>
              )}

              {/* Images */}
              <div className="border-t border-gray-300 pt-4">
                <p className="text-base font-medium text-gray-700 mb-1">Product Images</p>
                <div className="flex flex-wrap items-start gap-3">
                  {[...(editableProduct.image || []), ...(editableProduct.newImagesPreview || [])].map((img, index) => {
                    const totalExisting = editableProduct.image?.length || 0;
                    const isNew = index >= totalExisting;
                    const realIndex = isNew ? index - totalExisting : index;

                    return (
                      <div key={index} className="relative w-24 h-24 flex-shrink-0 group">
                        <div className="w-24 h-24 border border-gray-300 rounded-sm overflow-hidden relative shadow-sm">
                          <Image
                            src={typeof img === "string" ? img : URL.createObjectURL(img)}
                            alt={`image-${index}`}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full group-hover:scale-105 transition"
                          />

                          {/* Primary Toggle */}
                          <button
                            onClick={() => {
                              const allImages = [
                                ...(editableProduct.image || []),
                                ...(editableProduct.newImagesPreview || []),
                              ];
                              const selected = allImages[index];
                              const reordered = [selected, ...allImages.filter((_, i) => i !== index)];

                              const newImageArray = reordered.filter((i) => typeof i === "string");
                              const newFileArray = reordered.filter((i) => typeof i !== "string");

                              setEditableProduct((prev) => ({
                                ...prev,
                                image: newImageArray,
                                newImages: newFileArray,
                                newImagesPreview: newFileArray,
                              }));
                            }}
                            className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center hover:bg-black"
                          >
                            {index === 0 ? "Primary" : "Make Primary"}
                          </button>

                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              if (!isNew) {
                                setEditableProduct((prev) => ({
                                  ...prev,
                                  image: prev.image.filter((_, i) => i !== realIndex),
                                }));
                              } else {
                                const newImgs = [...(editableProduct.newImages || [])];
                                const previews = [...(editableProduct.newImagesPreview || [])];
                                newImgs.splice(realIndex, 1);
                                previews.splice(realIndex, 1);

                                setEditableProduct((prev) => ({
                                  ...prev,
                                  newImages: newImgs,
                                  newImagesPreview: previews,
                                }));
                              }
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-800"
                            title="Remove"
                          >
                            –
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Image Input */}
                  {((editableProduct.image?.length || 0) + (editableProduct.newImagesPreview?.length || 0)) < 6 && (
                    <label className="w-24 h-24 border border-dashed border-gray-400 rounded-sm cursor-pointer flex items-center justify-center hover:border-[var(--sage)] hover:text-[var(--sage)] transition">
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setEditableProduct((prev) => ({
                            ...prev,
                            newImages: [...(prev.newImages || []), file],
                            newImagesPreview: [...(prev.newImagesPreview || []), file],
                          }));
                        }}
                      />
                      <ImagePlus className="w-6 h-6" />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                className="mt-4 w-full bg-[var(--sage)] text-white 
                  hover:bg-zinc-500 py-2.5 
                  rounded-sm cursor-pointer uppercase font-medium disabled:opacity-50  disabled:cursor-not-allowed
                  transition"
                onClick={() => handleProductUpdate(editableProduct)}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>
        )}

        {viewProduct && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-sm p-6 max-w-lg w-full relative space-y-5 text-sm max-h-[90vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={() => setViewProduct(null)}
                className="absolute top-3 right-3 text-gray-400 cursor-pointer hover:text-red-500 transition"
              >
                ✖
              </button>

              {/* Title */}
              <h2 className="text-xl font-medium text-gray-800 mb-3 uppercase border-b pb-2">
                {viewProduct.name}
              </h2>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700 text-sm">
                <p><span className="font-medium text-gray-900">Category:</span> {viewProduct.category}</p>
                <p><span className="font-medium text-gray-900">SubCategory:</span> {viewProduct.subcategory}</p>
                <p><span className="font-medium text-gray-900">Brand:</span> {viewProduct.brand}</p>
                <p><span className="font-medium text-gray-900">Color:</span> {viewProduct.color}</p>
                <p>
                  <span className="font-medium text-gray-900">Price:</span>{" "}
                  <span className="line-through text-gray-500">{currency}{viewProduct.price}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-900">Offer Price:</span>{" "}
                  <span className="text-gray-700 font-medium">{currency}{viewProduct.offerPrice}</span>
                </p>
                {/* Stock Breakdown */}
                <div className="col-span-2">
                  <p className="font-medium text-gray-900 mb-2">Stock (By Size):</p>

                  <div className="space-y-2">
                    {viewProduct.sizes?.map((size, i) => {
                      const stock = Number(size.stock || 0);

                      return (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="font-light text-gray-500">{size.size}</span>

                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-normal ${
                              stock === 0
                                ? "bg-red-100 text-red-600"
                                : stock <= 3
                                ? "bg-gray-100 text-gray-700"
                                : "bg-[var(--sage)] text-white"
                            }`}
                          >
                            {stock}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                    Total:{" "}
                    {viewProduct.sizes?.reduce(
                      (sum, s) => sum + Number(s.stock || 0),
                      0
                    )}{" "}
                    units
                  </div>
                </div>
                <p>
                  <span className="font-medium text-gray-900">Visibility:</span>{" "}
                  {viewProduct.visible ? "Visible" : "Hidden"}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base font-medium text-gray-800 mb-3 uppercase">Description</h3>
                <div
                  className="text-gray-600 text-sm leading-relaxed border rounded-sm p-3 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: viewProduct.description }}
                />
              </div>

              {/* Images */}
              {viewProduct.image?.length > 0 && (
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-3 uppercase">Gallery</h3>
                  <div className="flex gap-2 flex-wrap">
                    {viewProduct.image.map((img, index) => (
                      <Image
                        key={index}
                        src={img}
                        alt={`image-${index}`}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-sm hover:scale-105 transition"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <p className="text-xs text-gray-500 text-right border-t pt-2">
                Created: {new Date(viewProduct.date).toLocaleString()}
              </p>
            </div>
          </div>
        )}


      </div>

    </div>
  );
};

export default ProductListPanel;
