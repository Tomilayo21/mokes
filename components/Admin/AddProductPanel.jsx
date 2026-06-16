'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/TiptapEditor";
import { useSession } from "next-auth/react";
import slugify from "slugify";


const AddProduct = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [files, setFiles] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [sizes, setSizes] = useState([
    { size: "Small", stock: 0 },
    { size: "Medium", stock: 0 },
    { size: "Large", stock: 0 },
    { size: "Extra Large", stock: 0 },
  ]);
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const isBlocked =
    status === "unauthenticated" ||
    (status === "authenticated" && session?.user?.role !== "admin");

  useEffect(() => {
    if (isBlocked) {
      router.replace("/");
    }
  }, [isBlocked, router]);

  useEffect(() => {
    if (uploadDone) {
      const timer = setTimeout(() => setUploadDone(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadDone]);

  if (isBlocked) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadDone(false);

    try {
      if (!session?.user) {
        toast.custom(
          (t) => (
            <div
              className={`${
                t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
              } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
            >
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                You must be logged in
              </p>
            </div>
          ),
          { duration: 3500, position: "top-right" }
        );
        return;
      }

      if (session.user.role !== "admin") {
        toast.error("You are not authorized to perform this action");
        return;
      }

      const baseSlug = slugify(name.trim(), {
        lower: true,
        strict: true,
      });

      const random = Math.floor(Math.random() * 10000);
      const slug = `${baseSlug}-${random}`;
      const formData = new FormData();
      const cleanPrice = price.toString().replace(/,/g, "");
      const cleanOfferPrice = offerPrice.toString().replace(/,/g, "");
      formData.append("name", name);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("price", cleanPrice);
      formData.append("offerPrice", cleanOfferPrice);
      formData.append("color", color);
      formData.append("brand", brand);
      formData.append("slug", slug);
      formData.append("subcategory", subcategory);
      formData.append("sizes", JSON.stringify(sizes));

      for (let i = 0; i < files.length; i++) {
        if (files[i]) formData.append("images", files[i]);
      }

      await axios.post("/api/product/add", formData, {
        headers: {
          // Send session token (optional, only if your route uses it)
          Authorization: `Bearer ${session?.accessToken || ""}`,
        },
      });

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } max-w-md w-full bg-gray-50 dark:bg-gray-50 shadow-sm rounded-sm pointer-events-auto flex items-center gap-3 p-4 transition-all`}
          >
            <p className="text-sm font-light tracking-wide text-gray-800 dark:text-gray-800">
              Product added successfully!
            </p>
          </div>
        ),
        { duration: 3000, position: "top-right" }
      );

      setFiles([]);
      setName("");
      setDescription("");
      setCategory("Earphone");
      setColor("");
      setBrand("");
      setPrice("");
      setOfferPrice("");
      setSubcategory("");
      setSizes([]);
      setUploadDone(true);
    } catch (error) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-sm rounded-sm pointer-events-auto flex items-center gap-3 p-4 transition-all`}
          >
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {error.response?.data?.message || error.message || "Upload failed"}
            </p>
          </div>
        ),
        { duration: 3000, position: "top-right" }
      );
    } finally {
      setUploading(false);
    }
  };

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

    "home&gifts": [
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
    <div className="flex-1 min-h-screen flex flex-col bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-10 max-w-4xl mx-auto space-y-8"
      >
        <h1 className="text-xl md:text-2xl tracking-wide uppercase font-normal text-gray-900">
          Add New Product
        </h1>

        {/* Product Images */}
        <div className="bg-white shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3 uppercase">
            Product Gallery
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Upload up to 10 images. The first image will be the primary.
          </p>
            {/* Image Upload */}
          <div className="flex flex-wrap items-start gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative w-28 h-28 overflow-hidden shadow-sm group"
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />

                {/* Primary Badge */}
                <span className={`absolute top-1 left-1 px-2 py-0.5 text-xs 
                  ${index === 0 ? "bg-green-600 text-white" : "bg-gray-700 text-white opacity-70"}`}>
                  {index === 0 ? "Primary" : "Secondary"}
                </span>

                {/* Actions on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col justify-center items-center gap-2 transition">
                  {index !== 0 && (
                    <button
                      onClick={() => {
                        const reordered = [file, ...files.filter((_, i) => i !== index)];
                        setFiles(reordered);
                      }}
                      className="text-white text-xs bg-purple-600 px-3 py-1 rounded hover:bg-purple-700"
                    >
                      Make Primary
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const updatedFiles = [...files];
                      updatedFiles.splice(index, 1);
                      setFiles(updatedFiles);
                    }}
                    className="text-white text-xs bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            {/* Upload New */}
            {files.length < 10 && (
              <label className="w-28 h-28 border-2 border-dashed border-gray-300  flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-[var(--sage)] hover:text-[var(--sage)] transition">
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const selectedFiles = Array.from(e.target.files);

                    setFiles((prev) => {
                      const combined = [...prev, ...selectedFiles];

                      // optional: prevent duplicates
                      return combined.filter(
                        (file, index, self) =>
                          index ===
                          self.findIndex(
                            (f) =>
                              f.name === file.name &&
                              f.size === file.size &&
                              f.lastModified === file.lastModified
                          )
                      );
                    });

                    e.target.value = "";
                  }}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mb-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">Add Image</span>
              </label>
            )}
          </div>

          {/* Product Info */}
          <div className="mt-8 space-y-6">

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label htmlFor="product-name" className="text-lg font-medium text-gray-800 mb-3 uppercase">
                Name
              </label>
              <input
                id="product-name"
                type="text"
                placeholder="Type product name"
                className="outline-none py-2.5 px-3 text-gray-800
                  rounded-sm 
                  border border-gray-300 focus:ring-2 
                  focus:ring-[var(--sage)]
                "
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-lg font-medium text-gray-800 mb-3 uppercase">Product Story</label>
              <TiptapEditor description={description} setDescription={setDescription} />
            </div>
          </div>
          
          {/* Options Grid */}
          <div className="mt-8 space-y-6">
            <h2 className="text-lg font-medium text-gray-800 mb-3 uppercase">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Category */}
              <div>
                <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  className="w-full text-black mt-1 py-2.5 px-3 rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  onChange={(e) => setCategory(e.target.value)}
                  value={category}
                >
                  <option value="" disabled>Select Category</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="home&gifts">Home and Gifts</option>
                </select>
              </div>

              {/* SubCategory */}
              <select
                id="subcategory"
                className="w-full mt-1 py-2.5 px-3 text-black rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                onChange={(e) => setSubcategory(e.target.value)}
                value={subcategory}
              >
                <option value="" disabled>
                  Select Subcategory
                </option>

                {(subcategoryMap[category] || []).map((item) => (
                  <option key={item} value={item}>
                    {item.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>

              {/* Color */}
              <div>
                <label
                  htmlFor="color"
                  className="text-sm font-medium text-gray-700"
                >
                  Color
                </label>

                <input
                  type="text"
                  id="color"
                  placeholder="Enter product color"
                  className="w-full text-black mt-1 py-2.5 px-3 rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              {/* Brand */}
              <div>
                <label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand</label>
                <select
                  id="brand"
                  className="w-full text-black mt-1 py-2.5 px-3 rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  onChange={(e) => setBrand(e.target.value)}
                  value={brand}
                  required
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

              {/* Size Inventory */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Size Inventory
                </label>

                <div className="flex flex-wrap gap-3 mt-3">
                  {sizes.map((item, index) => (
                    <div
                      key={item.size}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)] rounded-sm bg-white"
                    >
                      <span className="text-sm font-medium text-black">
                        {item.size}
                      </span>

                      <input
                        type="number"
                        min="0"
                        value={item.stock}
                        onChange={(e) => {
                          const updated = [...sizes];
                          updated[index].stock = Number(e.target.value);
                          setSizes(updated);
                        }}
                        className="w-14 text-center text-sm outline-none text-gray-800"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Prices */}
              <div>
                <label htmlFor="product-price" className="text-sm font-medium text-gray-700">Original Price</label>
                <input
                  id="product-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full mt-1 placeholder:text-gray-400 text-black py-2.5 px-3 rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");

                    if (/^\d*$/.test(rawValue)) {
                      setPrice(
                        rawValue === ""
                          ? ""
                          : Number(rawValue).toLocaleString()
                      );
                    }
                  }}
                  value={price}
                  required
                />
              </div>

              <div>
                <label htmlFor="offer-price" className="text-sm font-medium text-gray-700">Discount Price</label>
                <input
                  id="offer-price"
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  className="w-full mt-1 placeholder:text-gray-400 text-black py-2.5 px-3 rounded-sm border border-gray-300 outline-none focus:ring-2 focus:ring-[var(--sage)]"
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/,/g, "");

                    if (/^\d*$/.test(rawValue)) {
                      setOfferPrice(
                        rawValue === ""
                          ? ""
                          : Number(rawValue).toLocaleString()
                      );
                    }
                  }}
                  value={offerPrice}
                  required
                />
              </div>

            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 space-y-6">
            <button
              type="submit"
              className="px-8 py-3 text-sm border-t border-zinc-300 cursor-pointer bg-[var(--sage)] text-white hover:bg-zinc-500 transition uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Add Product"}
            </button>
            {/* {uploadDone && !uploading && (
              <p className="text-orange-600 font-semibold"> <CheckCircle className="text-orange-500" size={22}/> Product uploaded successfully!</p>
            )} */}
          </div>
        </div>



      </form>
    </div>
  );

};

export default AddProduct;
