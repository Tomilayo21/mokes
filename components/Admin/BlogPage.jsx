"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import BlogEditor from "@/components/admin/BlogEditor";


export default function AdminBlogPage() {
  const [posts, setPosts] = useState([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);

  const load = async () => {
    const res = await axios.get("/api/blog?limit=50");
    setPosts(res.data.posts);
  };

  const remove = async (id) => {
    if (!confirm("Delete this post?")) return;
    await axios.delete(`/api/blog/${id}`);
    load();
  };

  const openEditModal = (post) => {
    setCurrentPost(post);
    setOpenEditor(true);
  };

  const closeModal = () => {
    setOpenEditor(false);
    setCurrentPost(null);
    load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">

      {/* New Post Button */}
      <button
        onClick={() => openEditModal(null)}
        className="px-4 py-2 bg-black text-white rounded"
      >
        New Post
      </button>

      {/* POSTS LIST */}
      <div className="mt-6 space-y-4">
        {posts.map((p) => (
          <div
            key={p._id}
            className="p-4 border rounded flex justify-between items-center bg-black"
          >
            <div>
              <p className="font-bold">{p.title}</p>
              <p className="text-sm text-gray-500">{p.slug}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openEditModal(p)}
                className="px-3 py-1 border rounded"
              >
                Edit
              </button>
              <button
                onClick={() => remove(p._id)}
                className="px-3 py-1 border rounded text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 🔥 EDITOR MODAL */}
      {openEditor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-3xl w-full h-[90vh] rounded-lg shadow-xl flex flex-col overflow-hidden">
            
            {/* HEADER */}
            <div className="sticky top-0 z-20 bg-white border-b px-6 py-4 flex justify-between items-center shrink-0">
              <h2 className="text-xl tracking-wide uppercase font-normal text-gray-900">
                {currentPost ? "Edit Post" : "New Post"}
              </h2>

              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto px-6 py-4">
                <BlogEditor initial={currentPost} onSaved={closeModal} />
              </div>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}
