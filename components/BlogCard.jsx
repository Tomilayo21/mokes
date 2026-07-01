"use client"
import Image from "next/image";
import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";

export default function BlogCard({ post }) {

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col h-full overflow-hidden bg-white transition-all duration-300"
    >
      {/* IMAGE */}
      <div className="relative w-full h-56 overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-100" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 mt-5">
        {/* TITLE */}
        <h2 className="text-sm md:text-sm font-normal text-gray-900 uppercase tracking-[0.2em] group-hover:text-black transition-colors">
          {post.title}
        </h2>

        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-2 min-w-0">
            {formatDate(post.createdAt)}
          </div>

          <div className="flex items-center gap-1 whitespace-nowrap">
            <Clock3 size={14} />
            <span>{post.readingTime} min</span>
          </div>
        </div>

        {/* EXCERPT */}
        <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed line-clamp-3 flex-grow">
          {post.excerpt}
        </p>

        {/* Categories */}
        {post.categories?.length > 1 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.categories.slice(1).map((cat) => (
              <span
                key={cat}
                className="underline text-gray-700 text-xs font-medium"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* AUTHOR + READ TIME */}
        <div className="flex items-center justify-between mt-5 text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-sm px-4 py-2 text-black border border-black text-sm font-medium group-hover:px-5 transition-all">
              Read Article
            </div>
          </div>

        </div>
      </div>
    </Link>
  );
}
