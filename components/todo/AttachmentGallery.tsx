"use client";

import { useRef } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { useAttachments } from "@/hooks/useAttachments";
import Image from "next/image";

interface AttachmentGalleryProps {
  todoId: number;
}

const AttachmentGallery = ({ todoId }: AttachmentGalleryProps) => {
  const { attachments, isLoading, addAttachment, isUploading, deleteAttachment } = useAttachments(todoId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      addAttachment(file);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-2 text-sm text-[var(--text-sub)]">첨부 이미지</div>
      <div className="flex flex-wrap gap-2">
        {isLoading && (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
            <Loader2 size={20} className="animate-spin text-[var(--text-sub)]" />
          </div>
        )}
        {attachments.map((att) => (
          <div key={att.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--border)]">
            <Image
              src={att.fileUrl}
              alt={att.fileName}
              fill
              className="object-cover"
              sizes="80px"
            />
            <button
              onClick={() => deleteAttachment(att.id)}
              className="absolute right-0.5 top-0.5 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[var(--text-sub)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Plus size={20} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AttachmentGallery;
