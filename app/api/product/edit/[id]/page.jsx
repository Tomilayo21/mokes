"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext"; // Your auth context with getToken() & user
import toast from "react-hot-toast";

const ProductEdit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, user } = useAppContext();

  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/product/${productId}`);
        if (data.success) {
          setProduct(data.product);
          setName(data.product.name || "");
          setPrice(data.product.offerPrice || "");
          setCategory(data.product.category || "");
          setDescription(data.product.description || "");
        } else {
          toast.error("Failed to load product");
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = await getToken();
      if (!token || !user) {
        toast.error("Unauthorized");
        return;
      }

      const updateData = {
        name,
        offerPrice: parseFloat(price),
        category,
        description,
      };

      const { data } = await axios.patch(`/api/product/${productId}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          userid: user.id,
        },
      });

      if (data.success) {
        toast.success("Product updated!");
        router.push("/admin/products"); // Redirect after success
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div>Loading product...</div>;
  if (!product) return <div>Product not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl mb-4">Edit Product</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </label>

        <label>
          Price:
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </label>

        <label>
          Category:
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="border p-2 rounded w-full"
          />
        </label>

        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="border p-2 rounded w-full"
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default ProductEdit;
