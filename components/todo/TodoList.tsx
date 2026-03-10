"use client";

import { AnimatePresence } from "framer-motion";
import { TodoListItem } from "@/types/todo";
import TodoItem from "./TodoItem";

interface TodoListProps {
  todos: TodoListItem[];
  completingIds?: Set<number>;
  highlightedIds?: Set<number>;
  highlightColor?: "green" | "violet";
  onToggle: (id: number) => void;
  onDetail: (id: number) => void;
  onDelete: (id: number) => void;
}

const TodoList = ({
  todos,
  completingIds,
  highlightedIds,
  highlightColor,
  onToggle,
  onDetail,
  onDelete,
}: TodoListProps) => {
  if (todos.length === 0 && (!completingIds || completingIds.size === 0)) {
    return (
      <div className="py-12 text-center text-[var(--text-sub)]">
        할 일이 없습니다. 새로운 할 일을 추가해보세요!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isCompleting={completingIds?.has(todo.id)}
            isHighlighted={highlightedIds?.has(todo.id)}
            highlightColor={highlightColor}
            onToggle={onToggle}
            onDetail={onDetail}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TodoList;
