'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';

const TiptapEditor = ({ description, setDescription }) => {

  const [isFocused, setIsFocused] = React.useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Paragraph,
      Placeholder.configure({
        placeholder: "Describe your product here",
      }),
    ],
    content: description || "",
    onUpdate: ({ editor }) => {
      setDescription?.(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (description) {
      editor.commands.setContent(description);
    }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    editor.on("focus", handleFocus);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("focus", handleFocus);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-2 text-black">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'font-bold bg-gray-200 px-2 py-1 rounded' : 'px-2 py-1 border'}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'italic bg-gray-200 px-2 py-1 rounded' : 'px-2 py-1 border'}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'underline bg-gray-200 px-2 py-1 rounded' : 'px-2 py-1 border'}
        >
          U
        </button>
      </div>

      {/* Editor Content */}
      <div
        className={`border text-black border-gray-300 min-h-[100px] rounded transition
            ${isFocused ? "ring-2 ring-[var(--sage)] border-transparent" : ""}`}
        >
        <EditorContent editor={editor}
          className="
            tiptap
            [&_.ProseMirror]:p-2
            [&_.ProseMirror]:min-h-[120px]
            [&_.ProseMirror]:outline-none
            [&_.ProseMirror]:text-black
          "
        />
      </div>
    </div>
  );
};

export default TiptapEditor;
