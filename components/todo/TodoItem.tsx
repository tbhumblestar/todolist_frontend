"use client";

import { motion } from "framer-motion";
import { Check, Clock, FileText, Paperclip, Trash2 } from "lucide-react";
import { TodoListItem } from "@/types/todo";
import Image from "next/image";

const getDueStatus = (dueDate: string) => {
  const now = Date.now();
  const due = new Date(dueDate).getTime();
  const diff = due - now;
  const h = diff / (1000 * 60 * 60);
  if (diff < 0) return "overdue" as const;
  if (h <= 1) return "urgent" as const;
  if (h <= 3) return "soon" as const;
  return "normal" as const;
};

const dueColorMap = {
  overdue: "text-red-400",
  urgent: "text-orange-400",
  soon: "text-yellow-500",
  normal: "text-[var(--text-sub)]",
};

const dueBorderMap = {
  overdue: "border-red-400/40",
  urgent: "",
  soon: "",
  normal: "",
};

const formatDueDate = (iso: string) => {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) return time;
  return `${d.getMonth() + 1}/${d.getDate()} ${time}`;
};

const formatRelative = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff <= 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 지남`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}시간 지남`;
  return `${Math.floor(hrs / 24)}일 지남`;
};

const formatRemaining = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return null;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}분 남음`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (remainMins === 0) return `${hrs}시간 남음`;
  return `${hrs}시간 ${remainMins}분 남음`;
};

interface TodoItemProps {
  todo: TodoListItem;
  isCompleting?: boolean;
  isHighlighted?: boolean;
  highlightColor?: "green" | "violet";
  onToggle: (id: number) => void;
  onDetail: (id: number) => void;
  onDelete: (id: number) => void;
}

const highlightStyles = {
  green: "border-[var(--green)] bg-[var(--green)]/5",
  violet: "border-violet-400 bg-violet-400/5",
};

const TodoItem = ({
  todo,
  isCompleting,
  isHighlighted,
  highlightColor = "green",
  onToggle,
  onDetail,
  onDelete,
}: TodoItemProps) => {
  const dueStatus = !todo.completed && todo.dueDate ? getDueStatus(todo.dueDate) : null;

  const baseBorder = dueStatus && dueBorderMap[dueStatus]
    ? dueBorderMap[dueStatus]
    : "border-[var(--border)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: isCompleting ? 0 : 1,
        y: 0,
        scale: isCompleting ? 0.97 : 1,
      }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: isCompleting ? 0.5 : 0.2,
        ease: "easeOut",
      }}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        isCompleting
          ? "border-[var(--green)] bg-[var(--green)]/10"
          : isHighlighted
            ? `${highlightStyles[highlightColor]} transition-colors duration-500`
            : `${baseBorder} bg-[var(--surface)] transition-colors duration-200 hover:bg-[var(--surface2)]`
      }`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors duration-200 ${
          todo.completed || isCompleting
            ? "border-[var(--green)] bg-[var(--green)]"
            : "border-[var(--border)]"
        }`}
      >
        {(todo.completed || isCompleting) && (
          <motion.div
            initial={isCompleting ? { scale: 0 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            <Check size={14} className="text-[var(--bg)]" />
          </motion.div>
        )}
      </button>

      <div
        onClick={() => onDetail(todo.id)}
        className="flex-1 cursor-pointer"
      >
        <span className="inline-flex items-center gap-2">
          <span
            className={`font-['DM_Sans'] transition-colors duration-200 ${
              todo.completed || isCompleting
                ? "text-[var(--text-sub)] line-through"
                : "text-[var(--text)]"
            }`}
          >
            {todo.title}
          </span>
          {todo.thumbnailUrl && (
            <span className="inline-block h-5 w-5 shrink-0 overflow-hidden rounded border border-[var(--border)]">
              <Image
                src={todo.thumbnailUrl}
                alt=""
                width={20}
                height={20}
                className="h-full w-full object-cover"
              />
            </span>
          )}
        </span>
        {todo.completed && todo.updatedAt && (
          <span className="ml-2 text-xs text-[var(--text-sub)]/60 inline-block">
            {new Date(todo.updatedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 완료
          </span>
        )}
        {!todo.completed && todo.dueDate && (
          <span className={`ml-2 inline-flex items-center gap-1 text-xs ${dueStatus ? dueColorMap[dueStatus] : "text-[var(--text-sub)]"}`}>
            <Clock size={11} />
            {formatDueDate(todo.dueDate)}
            {dueStatus === "overdue" && (
              <span className="text-red-400/80">({formatRelative(todo.dueDate)})</span>
            )}
            {(dueStatus === "urgent" || dueStatus === "soon") && (
              <span>({formatRemaining(todo.dueDate)})</span>
            )}
          </span>
        )}
        {!todo.completed && !todo.dueDate && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--text-sub)]/40">
            <Clock size={11} />
            마감 없음
          </span>
        )}
        {todo.completed && todo.dueDate && (
          <span className="ml-2 inline-flex items-center gap-1 text-xs text-[var(--text-sub)]/60">
            <Clock size={11} />
            {formatDueDate(todo.dueDate)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {todo.attachmentCount > 0 && (
          <span className="flex items-center gap-0.5 text-xs text-[var(--text-sub)]/60">
            <Paperclip size={12} />
            {todo.attachmentCount}
          </span>
        )}
        <button
          onClick={() => onDetail(todo.id)}
          className="rounded p-1.5 text-[var(--text-sub)] transition hover:bg-[var(--surface2)] hover:text-[var(--text)]"
        >
          <FileText size={16} />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="rounded p-1.5 text-[var(--text-sub)] transition hover:bg-[var(--surface2)] hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default TodoItem;
