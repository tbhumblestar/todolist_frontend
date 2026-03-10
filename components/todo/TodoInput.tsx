"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface TodoInputProps {
  onSubmit: (title: string) => void;
}

const TodoInput = ({ onSubmit }: TodoInputProps) => {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="새로운 할 일을 입력하세요"
        className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text)] placeholder-[var(--text-sub)] outline-none transition focus:border-[var(--accent)]"
      />
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 font-medium text-white transition hover:opacity-90"
      >
        <Plus size={18} />
        추가
      </button>
    </form>
  );
};

export default TodoInput;
