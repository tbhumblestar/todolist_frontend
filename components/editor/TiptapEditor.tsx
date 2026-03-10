"use client";

import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import { TiptapJSON } from "@/types/todo";
import { uploadApi } from "@/lib/api";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
  ImageIcon,
} from "lucide-react";

interface TiptapEditorProps {
  content: TiptapJSON | null;
  onChange: (json: TiptapJSON) => void;
  editable?: boolean;
  placeholder?: string;
}

const TiptapEditor = ({
  content,
  onChange,
  editable = true,
  placeholder = "설명을 입력하세요...",
}: TiptapEditorProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      ImageExtension.configure({ inline: false }),
    ],
    content: content ?? undefined,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapJSON);
    },
  });

  // content prop이 바뀌면 에디터에 반영 (API 데이터 로드 시)
  useEffect(() => {
    if (editor && content) {
      const currentJSON = JSON.stringify(editor.getJSON());
      const newJSON = JSON.stringify(content);
      if (currentJSON !== newJSON) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    try {
      const result = await uploadApi.uploadImage(file);
      editor.chain().focus().setImage({ src: result.url, alt: result.fileName }).run();
    } catch {
      // upload failed silently
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      {editable && (
        <div className="flex flex-wrap gap-1 border-b border-[var(--border)] px-2 py-1.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
          >
            <Bold size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
          >
            <Italic size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
          >
            <Strikethrough size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
          >
            <Code size={16} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
          >
            <Heading1 size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
          >
            <Heading2 size={16} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
          >
            <List size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
          >
            <ListOrdered size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
          >
            <Quote size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            active={false}
          >
            <Minus size={16} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
          >
            <Undo size={16} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
          >
            <Redo size={16} />
          </ToolbarButton>
          <Divider />
          <ToolbarButton
            onClick={() => imageInputRef.current?.click()}
            active={false}
          >
            <ImageIcon size={16} />
          </ToolbarButton>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = "";
            }}
            className="hidden"
          />
        </div>
      )}
      <EditorContent
        editor={editor}
        className="prose prose-invert max-w-none px-4 py-3 text-[var(--text)] [&_.tiptap]:min-h-[120px] [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-[var(--text-sub)] [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none [&_.tiptap_p.is-editor-empty:first-child::before]:h-0 [&_.tiptap_img]:max-w-full [&_.tiptap_img]:rounded-lg [&_.tiptap_img]:my-2"
      />
    </div>
  );
};

const ToolbarButton = ({
  onClick,
  active,
  children,
}: {
  onClick: () => void;
  active: boolean;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded p-1.5 transition ${
      active
        ? "bg-[var(--accent)] text-white"
        : "text-[var(--text-sub)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
    }`}
  >
    {children}
  </button>
);

const Divider = () => (
  <div className="mx-1 h-6 w-px self-center bg-[var(--border)]" />
);

export default TiptapEditor;
