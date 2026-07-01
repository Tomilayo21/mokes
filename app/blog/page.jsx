"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Relative URL works in the browser
        const res = await fetch("/api/blog");
        if (!res.ok) throw new Error("Failed to fetch posts");
        const data = await res.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);


  useEffect(() => {
    const navbar = document.getElementById("main-navbar");
    if (navbar) {
      const updateHeight = () => {
        const height = navbar.offsetHeight;
        document.documentElement.style.setProperty("--navbar-height", height + "px");
      };

      updateHeight();
      window.addEventListener("resize", updateHeight);

      return () => window.removeEventListener("resize", updateHeight);
    }
  }, []);
  

  return (
    <div>
      <Navbar />
      <div className="px-8 py-16 max-w-7xl bg-gray-50 mx-auto pt-[calc(var(--navbar-height)+1rem)]">
        <h1 className="text-3xl md:text-3xl font-bold text-center mb-8 tracking-tight text-gray-900">
          Insights & Market Trends
        </h1>

        {loading ? (
          <p className="text-center text-gray-600">Loading posts...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-600 text-2xl md:text-3xl font-semibold">
            No posts available. Please check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <a
                href={`/blog/${post.slug}`}
                key={post._id}
                className="group block rounded-md overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {post.featuredImage && (
                  <div className="relative w-full h-56 overflow-hidden">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.categories?.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-light rounded-md"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-2xl font-medium text-gray-700 leading-tight mb-3 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-5 font-light line-clamp-3 text-justify leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex justify-between items-center text-gray-500 text-sm">
                    <span className="font-medium">{post.author?.name || "Unknown Author"}</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                  <div className="mt-5">
                    <span className="text-blue-700/80 font-semibold group-hover:underline">
                      Read More →
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
