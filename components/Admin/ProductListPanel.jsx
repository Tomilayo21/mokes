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
      const token = await getToken();
      const { data } = await axios.delete(`/api/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}`, userid: user.id },
      });
      if (data.success) {
        toast.success("Product deleted");
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        setFilteredProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        toast.error(data.message || "Failed to delete");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const toggleVisibility = async (id) => {
    try {
      const token = await getToken();
      const { data } = await axios.patch(
        `/api/product/${id}`,
        { toggleVisibility: true },
        {
          headers: { Authorization: `Bearer ${token}`, userid: user.id },
        }
      );

      if (data.success) {
        toast.success("Visibility updated");
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? { ...p, visible: data.visible } : p
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const token = await getToken();
      const res = await fetch(`/api/product/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          userid: user.id,
        },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) throw new Error("Failed to update stock");

      toast.success("Stock updated");

      setProducts((prev) =>
        prev.map((product) =>
          product._id === productId ? { ...product, stock: newStock } : product
        )
      );
      setFilteredProducts((prev) =>
        prev.map((product) =>
          product._id === productId ? { ...product, stock: newStock } : product
        )
      );
    } catch (err) {
      toast.error("Error updating stock");
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

      if (!res.ok) throw new Error("Update failed");

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
              max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4
              transform transition-all duration-300 ease-in-out
              ${t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}
            `}
          >
            <CheckCircle className="text-green-500" size={22} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
            <AlertCircle className="text-red-500" size={22} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">

      <div className="w-full md:p-10 p-4 max-w-7xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-normal text-gray-800">All Products</h2>
          <button
            onClick={handleExportCSV}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm shadow-sm transition"
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
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-wrap gap-4 items-center">
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
              className="pl-9 border px-3 py-2 rounded-lg text-sm w-full focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none"
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
            className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          >
            <option value="none">Sort</option>
            <option value="price-asc">Price Low → High</option>
            <option value="price-desc">Price High → Low</option>
            <option value="stock-asc">Stock Low → High</option>
            <option value="stock-desc">Stock High → Low</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-white border border-gray-200 rounded-lg shadow-md overflow-x-auto">
          <table className="table-fixed w-full border-collapse">
            <thead className="bg-gray-50 text-gray-800 text-sm sticky top-0">
              <tr>
                <th className="px-4 py-3 font-medium text-left">Product</th>
                <th className="px-4 py-3 font-medium text-left">Category</th>
                <th className="px-4 py-3 font-medium text-left">Price</th>
                <th className="px-4 py-3 font-medium text-left">Stock</th>
                <th className="px-4 py-3 font-medium text-left">Status</th>
                <th className="px-4 py-3 font-medium text-left">Visibility</th>
                <th className="px-4 py-3 font-medium text-left">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-700">
              {paginatedProducts.map((product, index) => (
                <tr
                  key={product._id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } border-t border-gray-200 hover:bg-orange-50 transition`}
                >
                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center space-y-2">
                      <Image
                        src={product.image[0]}
                        alt="product image"
                        className="w-14 h-14 object-cover rounded-md border shadow-sm"
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

                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 font-normal text-gray-800">
                    {currency}
                    {Number(product.offerPrice).toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 text-sm font-medium bg-gray-100 rounded-md">
                      {stockInputs[product._id] ?? product.stock}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-2 py-1 text-sm font-medium bg-gray-100 rounded-md">
                      {product.sizes?.reduce(
                        (sum, size) => sum + Number(size.stock || 0),
                        0
                      )}
                    </span>
                  </td>

                  {/* Visibility */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleVisibility(product._id)}
                      className={`px-3 py-1.5 rounded-md text-white text-xs font-medium transition ${
                        product.visible ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-400 hover:bg-gray-500"
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
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex gap-4 hover:shadow-md transition"
            >
              <Image
                src={product.image[0]}
                alt="product image"
                width={80}
                height={80}
                className="w-20 h-20 object-cover rounded-md border"
              />

              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-base truncate text-gray-800">{product.name}</h3>
                <p className="text-xs text-gray-500">{product.category}</p>
                <p className="text-sm font-normal text-gray-800">              
                  {currency}
                  {Number(product.offerPrice).toLocaleString()}
                </p>

                <div className="mt-1 flex items-center gap-2">
                  {product.sizes?.reduce(
                    (sum, size) => sum + Number(size.stock || 0),
                    0
                  )}
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
                      product.visible ? "bg-orange-500 hover:bg-orange-600" : "bg-gray-400 hover:bg-gray-500"
                    }`}
                  >
                    {product.visible ? "Visible" : "Hidden"}
                  </button>
                </div>
              </div>
            </div>
          ))}
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
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full relative shadow-2xl space-y-6 text-sm max-h-[90vh] overflow-y-auto">

              {/* Close Button */}
              <button
                onClick={() => setOpenProduct(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
              >
                ✖
              </button>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 border-b pb-3">
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
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editableProduct.category}
                      onChange={(e) =>
                        setEditableProduct({ ...editableProduct, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="Earphone">Earphone</option>
                      <option value="Headphone">Headphone</option>
                      <option value="Watch">Watch</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Camera">Camera</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>

                  {/* SubCategory */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SubCategory</label>
                    <select
                      value={editableProduct.subcategory}
                      onChange={(e) =>
                        setEditableProduct({ ...editableProduct, subcategory: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="Earphone">Earphone</option>
                      <option value="Headphone">Headphone</option>
                      <option value="Watch">Watch</option>
                      <option value="Smartphone">Smartphone</option>
                      <option value="Laptop">Laptop</option>
                      <option value="Camera">Camera</option>
                      <option value="Accessories">Accessories</option>
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
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                    >
                      <option value="Apple">Apple</option>
                      <option value="Samsung">Samsung</option>
                      <option value="Sony">Sony</option>
                      <option value="Huawei">Huawei</option>
                      <option value="Bose">Bose</option>
                      <option value="Infinix">Infinix</option>
                      <option value="Xiaomi">Xiaomi</option>
                      <option value="Tecno">Tecno</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <select
                    value={editableProduct.color}
                    onChange={(e) =>
                      setEditableProduct({ ...editableProduct, color: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Silver">Silver</option>
                    <option value="Blue">Blue</option>
                    <option value="Red">Red</option>
                    <option value="Gold">Gold</option>
                    <option value="Green">Green</option>
                  </select>
                </div>
              </div>

              {/* Pricing Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ({currency})</label>
                  <input
                    type="number"
                    value={editableProduct.price}
                    onChange={(e) =>
                      setEditableProduct({
                        ...editableProduct,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price ({currency})</label>
                  <input
                    type="number"
                    value={editableProduct.offerPrice}
                    onChange={(e) =>
                      setEditableProduct({
                        ...editableProduct,
                        offerPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
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
                      <span className="w-24">{item.size}</span>

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
                        className="border px-3 py-2 rounded-lg w-28"
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
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
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
              <div className="border-t pt-4">
                <p className="text-base font-semibold mb-2">Product Images</p>
                <div className="flex flex-wrap items-start gap-3">
                  {[...(editableProduct.image || []), ...(editableProduct.newImagesPreview || [])].map((img, index) => {
                    const totalExisting = editableProduct.image?.length || 0;
                    const isNew = index >= totalExisting;
                    const realIndex = isNew ? index - totalExisting : index;

                    return (
                      <div key={index} className="relative w-24 h-24 flex-shrink-0 group">
                        <div className="w-24 h-24 border border-gray-300 rounded-lg overflow-hidden relative shadow-sm">
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
                    <label className="w-24 h-24 border border-dashed border-gray-400 rounded-lg cursor-pointer flex items-center justify-center hover:border-orange-500 hover:text-orange-500 transition">
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
                className="mt-4 w-full bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition"
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
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full relative shadow-2xl space-y-5 text-sm max-h-[90vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={() => setViewProduct(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
              >
                ✖
              </button>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                {viewProduct.name}
              </h2>

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-700 text-sm">
                <p><span className="font-medium text-gray-900">SubCategory:</span> {viewProduct.subcategory}</p>
                <p><span className="font-medium text-gray-900">Brand:</span> {viewProduct.brand}</p>
                <p><span className="font-medium text-gray-900">Color:</span> {viewProduct.color}</p>
                <p>
                  <span className="font-medium text-gray-900">Price:</span>{" "}
                  <span className="line-through text-gray-500">{currency}{viewProduct.price}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-900">Offer Price:</span>{" "}
                  <span className="text-orange-600 font-semibold">{currency}{viewProduct.offerPrice}</span>
                </p>
                <p><span className="font-medium text-gray-900">Stock:</span> {viewProduct.stock}</p>
                <p>
                  <span className="font-medium text-gray-900">Status:</span>{" "}
                  <span className={viewProduct.stock > 0 ? "text-orange-600 font-semibold" : "text-red-500 font-semibold"}>
                    {viewProduct.stock > 0 ? "In Stock" : "Sold Out"}
                  </span>
                </p>
                <p>
                  <span className="font-medium text-gray-900">Visibility:</span>{" "}
                  {viewProduct.visible ? "Visible" : "Hidden"}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">Description</h3>
                <div
                  className="text-gray-600 text-sm leading-relaxed border rounded-lg p-3 bg-gray-50"
                  dangerouslySetInnerHTML={{ __html: viewProduct.description }}
                />
              </div>

              {/* Images */}
              {viewProduct.image?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Gallery</h3>
                  <div className="flex gap-2 flex-wrap">
                    {viewProduct.image.map((img, index) => (
                      <Image
                        key={index}
                        src={img}
                        alt={`image-${index}`}
                        width={96}
                        height={96}
                        className="w-24 h-24 object-cover rounded-lg shadow-sm hover:scale-105 transition"
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
