
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useSession } from "next-auth/react";
import slugify from "slugify";
import DOMPurify from "isomorphic-dompurify";
import "react-quill-new/dist/quill.snow.css";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";


const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});


export default function BlogEditor({ initial = null, onSaved }) {
  const { data: session } = useSession();
  const quillRef = useRef(null);

  const [title, setTitle] = useState(initial?.title || "");
  const [content, setContent] = useState(initial?.content || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription || ""
  );
  const [featuredImage, setFeaturedImage] = useState(
    initial?.featuredImage || ""
  );
  const [categories, setCategories] = useState(
    initial?.categories?.join(", ") || ""
  );
  const [tags, setTags] = useState(initial?.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const autoSaveTimerRef = useRef(null);
  const slug = slugify(title, { lower: true, strict: true });
  const [postId, setPostId] = useState(initial?._id || null);
  const [publishState, setPublishState] = useState("Publish");
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);

  const clearForm = () => {
    setTitle("");
    setContent("");
    setExcerpt("");
    setMetaTitle("");
    setMetaDescription("");
    setFeaturedImage("");
    setCategories("");
    setTags("");
    setPostId(null);
  };

  useEffect(() => {
    if (!session?.user?.id) return;
    if (!postId) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      save("draft", true);
    }, 5000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    title,
    content,
    excerpt,
    metaTitle,
    metaDescription,
    featuredImage,
    categories,
    tags,
    postId,
    session,
  ]);

  useEffect(() => {
    if (!initial) return;

    setPostId(initial._id || null);
    setTitle(initial.title || "");
    setContent(initial.content || "");
    setExcerpt(initial.excerpt || "");
    setMetaTitle(initial.metaTitle || "");
    setMetaDescription(initial.metaDescription || "");

    // IMPORTANT: prevent overwriting uploaded value unnecessarily
    setFeaturedImage((prev) =>
      prev ? prev : initial.featuredImage || ""
    );

    setCategories(initial.categories?.join(", ") || "");
    setTags(initial.tags?.join(", ") || "");
  }, [initial]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await axios.post("/api/blog/upload", formData);
        const quill = quillRef.current?.getEditor();
        if (!quill) return;
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", res.data.url);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };
  }, []);

  const handleFeaturedUpload = async (file) => {
    if (!file) return;

    setUploadingFeaturedImage(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/blog/upload", formData);

      if (!res.data?.url) throw new Error("No URL returned");

      setFeaturedImage(res.data.url);
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed");
    } finally {
      setUploadingFeaturedImage(false);
    }
  };

  const save = async (status = "published", isAuto = false) => {
    if (!session?.user?.id) return;
    if (!title.trim()) return;

    if (!isAuto) {
      setLoading(true);

      if (status === "published") {
        setPublishState("Publishing...");
      }
    }

    if (!featuredImage && status === "published") {
      toast.error("Featured image is required before publishing");
      return;
    }

    const parsedCategories = categories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title,
      content,
      excerpt,
      metaTitle,
      metaDescription,
      featuredImage,
      status,
      slug,
      author: session.user.id,
      categories: parsedCategories,
      tags: parsedTags,
    };

    try {
      // ----------------------------------------------------
      // UPDATE EXISTING POST
      // ----------------------------------------------------
      if (postId) {
        await axios.put(`/api/blog/${postId}`, payload);

        if (!isAuto) {
          if (status === "published") {
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                  } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
                >
                  <CheckCircle className="text-green-500" size={22} />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Post updated successfully!
                  </p>
                </div>
              ),
              { duration: 3000, position: "top-right" }
            );

            setPublishState("Published ✓");
            setTimeout(() => setPublishState("Publish"), 2000);
          } else {
            // draft update toast
            toast.custom(
              (t) => (
                <div
                  className={`${
                    t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                  } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
                >
                  <CheckCircle className="text-green-500" size={22} />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Draft updated
                  </p>
                </div>
              ),
              { duration: 2500, position: "top-right" }
            );
          }
        }

        if (!isAuto && onSaved) onSaved();
        setLoading(false);
        return;
      }

      // ----------------------------------------------------
      // CREATE NEW POST
      // ----------------------------------------------------
      const res = await axios.post("/api/blog", payload);
      setPostId(res.data.post._id);

      if (!isAuto) {
        if (status === "published") {
          clearForm();

          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
              >
                <CheckCircle className="text-green-500" size={22} />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Post published successfully!
                </p>
              </div>
            ),
            { duration: 3000, position: "top-right" }
          );

          setPublishState("Published ✓");
          setTimeout(() => setPublishState("Publish"), 2000);
        } else {
          // draft created toast
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
                } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
              >
                <CheckCircle className="text-green-500" size={22} />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Draft saved
                </p>
              </div>
            ),
            { duration: 2500, position: "top-right" }
          );
        }
      }

      if (!isAuto && onSaved) onSaved();

    } catch (error) {
      console.error("Save error:", error);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4 transition-all`}
          >
            <XCircle className="text-red-500" size={22} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {error.response?.data?.message ||
                error.message ||
                "Error saving post"}
            </p>
          </div>
        ),
        { duration: 3000, position: "top-right" }
      );
    }

    setLoading(false);
  };

  const cleanContent = useMemo(() => {

    if (!content) return "";



    return content

      .replace(/<[^>]*>/g, " ")

      .replace(/&nbsp;/g, " ")

      .replace(/\u00a0/g, " ")

      .replace(/\s+/g, " ")

      .trim();

  }, [content]);

  const wordCount = useMemo(() => {

    if (!cleanContent) return 0;

    return cleanContent.split(" ").filter(Boolean).length;

  }, [cleanContent]);  

  const seoScoreValue = useMemo(() => {
    let score = 0;

    const words = wordCount;

    if (title?.trim().length >= 30 && title?.trim().length <= 60) {
      score += 30;
    }

    if (
      metaDescription?.trim().length >= 70 &&
      metaDescription?.trim().length <= 160
    ) {
      score += 30;
    }

    if (words >= 300) score += 40;
    else if (words >= 150) score += 20;
    else if (words >= 50) score += 10;

    return score;
  }, [title, metaDescription, wordCount]);


  const inputClass =
    "w-full p-2 border border-gray-300 rounded text-black placeholder:text-black bg-white";


  return (
    <div className="h-full flex flex-col">
      {/* Title & Excerpt */}
      <div className=" space-y-6 pr-2">
        <div>
          <label
            htmlFor="title"
            className="text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={inputClass}
          />
        </div>  
        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt"
          className={inputClass}
        />

        {/* Quill Editor */}
        <div className="border border-gray-300 rounded overflow-hidden max-w-full">
          <ReactQuill
            ref={quillRef}

            value={content}
            onChange={(html) => setContent(html)}
            theme="snow"
            modules={{
              toolbar: {
                container: [
                  [{ header: [1, 2, 3, false] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ list: "ordered" }, { list: "bullet" }],
                  ["link", "image"],
                  ["clean"],
                ],
                handlers: {
                  image: handleImageUpload,
                },
              },
            }}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "blockquote",
              "list",
              "bullet",
              "indent",
              "link",
              "image",
              "align",
            ]}
            className="min-h-[200px] max-h-[500px] overflow-y-auto bg-white"
          />
        </div>

        {/* Word count & SEO */}
        <div className="flex justify-between items-center text-gray-500 text-sm">
          <p>Word count: {wordCount}</p>
          <p>SEO Score: {seoScoreValue}%</p>
        </div>

        {/* Categories & Tags */}
        <input
          value={categories}
          onChange={(e) => setCategories(e.target.value)}
          placeholder="Categories (comma separated)"
          className={inputClass}
        />

        <p className="font-semibold text-black">Tags</p>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma separated)"
          className={inputClass}
        />

        {/* Featured Image */}
        <div className="space-y-2">
          <p className="font-semibold text-black">Featured Image</p>
          {featuredImage && (
            <img src={featuredImage} alt="Featured" className="w-48 rounded" />
          )}
          <input
            type="file"
            disabled={uploadingFeaturedImage}
            onChange={(e) => handleFeaturedUpload(e.target.files?.[0])}
            className="text-black"
          />
          {uploadingFeaturedImage && (
            <p className="text-sm text-gray-400">Uploading image...</p>
          )}
        </div>

        {/* Meta fields */}
        <input
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          placeholder="Meta title"
          className={inputClass}
        />
        <input
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          placeholder="Meta description"
          className={inputClass}
        />

        {/* Live Preview */}
        {/* <div className="border p-4 rounded bg-black dark:bg-black overflow-x-hidden">
          <h3 className="font-semibold mb-2 text-white">Live Preview</h3>

          <div className="prose prose-invert max-w-full overflow-x-hidden">
            <div
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          </div>
        </div> */}

        <div className="sticky bottom-0 bg-white border-t pt-4 pb-2 flex gap-2 shrink-0">
          <button
            disabled={loading}
            onClick={() => save("draft")}
            className="px-3 py-2 rounded bg-gray-400 text-white"
          >
            Save Draft
          </button>

          <button
            disabled={loading || uploadingFeaturedImage}
            onClick={() => save("published")}
            className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {publishState}
          </button>
        </div>
      </div>
    </div>
  );
}
