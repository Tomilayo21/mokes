'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';

const TiptapEditor = ({ description, setDescription }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      Paragraph,
      Underline,
      TextStyle,
      Placeholder.configure({
        placeholder: 'Type your message here...', // ✅ Your placeholder text
      }),
    ],
    content: description || '',
    onUpdate: ({ editor }) => {
      if (typeof setDescription === 'function') {
        setDescription(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (editor && description) {
      editor.commands.setContent(description);
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-2">
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
      <div className="border border-gray-300 p-2 min-h-[100px] rounded">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TiptapEditor;
