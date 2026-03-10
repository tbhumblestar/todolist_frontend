"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Clock, Plus, Loader2 } from "lucide-react";
import { todoApi, uploadApi } from "@/lib/api";
import { TiptapJSON } from "@/types/todo";
import TiptapEditor from "@/components/editor/TiptapEditor";
import AttachmentGallery from "@/components/todo/AttachmentGallery";
import Image from "next/image";

export interface PendingAttachment {
  url: string;
  fileName: string;
  fileSize: number;
}

interface TodoDetailModalProps {
  todoId: number | null;
  isCreate?: boolean;
  onClose: () => void;
  onCreate?: (params: { title: string; description?: TiptapJSON | null; dueDate?: string | null; pendingAttachments?: PendingAttachment[] }) => void;
  onSave?: (params: { id: number; title: string; description?: TiptapJSON | null; dueDate?: string | null }) => void;
}

// 로컬 시간 기준 "yyyy-MM-ddTHH:mm:ss" 형식 (UTC 변환 없음)
const toLocalISOString = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}:${sec}`;
};

const toDatetimeLocalValue = (val: string) => {
  // "yyyy-MM-ddTHH:mm:ss" → "yyyy-MM-ddTHH:mm"
  return val.slice(0, 16);
};

const fromDatetimeLocalValue = (val: string) => {
  // "yyyy-MM-ddTHH:mm" → "yyyy-MM-ddTHH:mm:00"
  return val + ":00";
};

const addHours = (hours: number) => {
  const d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return toLocalISOString(d);
};

const tomorrowSameTime = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toLocalISOString(d);
};

const TodoDetailModal = ({ todoId, isCreate, onClose, onCreate, onSave }: TodoDetailModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState<TiptapJSON | null>(null);
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [selectedQuick, setSelectedQuick] = useState<string | null>(null);
  const [editorKey, setEditorKey] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const createFileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: todo, isSuccess } = useQuery({
    queryKey: ["todo", todoId],
    queryFn: () => todoApi.getTodo(todoId!),
    enabled: todoId !== null && !isCreate,
  });

  // 수정 모드: API 데이터 로드 시 상태 세팅
  useEffect(() => {
    if (isSuccess && todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setDueDate(todo.dueDate);
      setSelectedQuick(todo.dueDate ? "custom" : null);
      setEditorKey((k) => k + 1);
    }
  }, [isSuccess, todo]);

  // 생성 모드: 초기화
  useEffect(() => {
    if (isCreate) {
      setTitle("");
      setDescription(null);
      setDueDate(null);
      setSelectedQuick(null);
      setPendingAttachments([]);
      setEditorKey((k) => k + 1);
    }
  }, [isCreate]);

  const handleDescriptionChange = useCallback((json: TiptapJSON) => {
    setDescription(json);
  }, []);

  const handleCreateUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadApi.uploadImage(file);
      setPendingAttachments((prev) => [...prev, { url: result.url, fileName: result.fileName, fileSize: result.fileSize }]);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    if (isCreate) {
      onCreate?.({ title: trimmed, description, dueDate, pendingAttachments: pendingAttachments.length > 0 ? pendingAttachments : undefined });
    } else if (todoId !== null) {
      onSave?.({ id: todoId, title: trimmed, description, dueDate });
      queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
    }
    onClose();
  };

  if (todoId === null && !isCreate) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-[var(--border)] bg-[var(--bg)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-lg font-semibold text-[var(--text)] outline-none"
            placeholder="제목을 입력하세요"
          />
          <button
            onClick={onClose}
            className="ml-3 rounded p-1.5 text-[var(--text-sub)] transition hover:bg-[var(--surface2)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-[var(--border)] px-6 py-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-[var(--text-sub)]">
            <Clock size={14} />
            <span>마감 시각</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "1h", label: "1시간 후", fn: () => addHours(1) },
              { key: "2h", label: "2시간 후", fn: () => addHours(2) },
              { key: "3h", label: "3시간 후", fn: () => addHours(3) },
              { key: "tomorrow", label: "내일 이 시간", fn: () => tomorrowSameTime() },
            ].map(({ key, label, fn }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setDueDate(fn()); setSelectedQuick(key); }}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${
                  selectedQuick === key
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-sub)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setDueDate(null); setSelectedQuick(null); }}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                selectedQuick === null
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--border)] text-[var(--text-sub)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
              }`}
            >
              없음
            </button>
          </div>
          {dueDate !== null && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="datetime-local"
                value={toDatetimeLocalValue(dueDate)}
                onChange={(e) => {
                  setDueDate(e.target.value ? fromDatetimeLocalValue(e.target.value) : null);
                  setSelectedQuick(e.target.value ? "custom" : null);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-4">
          <TiptapEditor
            key={editorKey}
            content={description}
            onChange={handleDescriptionChange}
            placeholder="설명을 입력하세요..."
          />
        </div>

        {isCreate ? (
          <div className="border-b border-[var(--border)] px-6 py-3">
            <div className="mb-2 text-sm text-[var(--text-sub)]">첨부 이미지</div>
            <div className="flex flex-wrap gap-2">
              {pendingAttachments.map((att, i) => (
                <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-[var(--border)]">
                  <Image src={att.url} alt={att.fileName} fill className="object-cover" sizes="80px" />
                  <button
                    onClick={() => setPendingAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                    className="absolute right-0.5 top-0.5 hidden rounded-full bg-black/60 p-0.5 text-white group-hover:block"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => createFileInputRef.current?.click()}
                disabled={isUploading}
                className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[var(--text-sub)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
              </button>
              <input
                ref={createFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCreateUpload(file);
                  e.target.value = "";
                }}
                className="hidden"
              />
            </div>
          </div>
        ) : todoId !== null ? (
          <div className="border-b border-[var(--border)] px-6 py-3">
            <AttachmentGallery todoId={todoId} />
          </div>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-[var(--border)] px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-sub)] transition hover:bg-[var(--surface2)]"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            {isCreate ? "추가" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TodoDetailModal;
