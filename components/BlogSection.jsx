"use client";

import React, { useState, useEffect } from "react";
import BlogCard from "./BlogCard";

export default function BlogSection({ limit = 3 }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/blog?limit=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [limit]);


  return (
    <section className="px-6 py-12 max-w-7xl mx-auto bg-white">
      <h1 className="text-sm md:text-lg text-black uppercase tracking-[0.25em] text-center">
        Latest Blog Posts
      </h1>
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {posts.map((post) => (
          <BlogCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
