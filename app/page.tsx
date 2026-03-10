"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useTodos } from "@/hooks/useTodos";
import { useTheme } from "@/hooks/useTheme";
import { authStorage } from "@/lib/auth";
import { todoApi } from "@/lib/api";
import TodoList from "@/components/todo/TodoList";
import TodoDetailModal from "@/components/todo/TodoDetailModal";
import { LogOut, Plus, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";

const toDateString = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
const formatDisplay = (dateStr: string) => {
  const today = toDateString(new Date());
  if (dateStr === today) return "오늘";
  const [, m, d] = dateStr.split("-");
  return `${Number(m)}월 ${Number(d)}일`;
};

function OAuthTokenHandler() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      authStorage.setToken(token);
      window.history.replaceState({}, "", "/");
      window.location.reload();
    }
  }, [searchParams]);
  return null;
}

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { todos, isLoading: todosLoading, createTodo, updateTodo, toggleTodo, deleteTodo } =
    useTodos();
  const [detailTodoId, setDetailTodoId] = useState<number | null>(null);
  const [isCreateModal, setIsCreateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [showCompleted, setShowCompleted] = useState(true);
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());
  const [uncompletingIds, setUncompletingIds] = useState<Set<number>>(new Set());
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set());
  const [highlightedIncompleteIds, setHighlightedIncompleteIds] = useState<Set<number>>(new Set());
  const highlightTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const completedQuery = useQuery({
    queryKey: ["completedTodos", selectedDate],
    queryFn: () => todoApi.getCompletedByDate(selectedDate),
    enabled: authStorage.isLoggedIn(),
    staleTime: 1000 * 30,
  });

  const handlePrevDate = () => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const prev = new Date(y, m - 1, d - 1);
    setSelectedDate(toDateString(prev));
  };

  const handleNextDate = () => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const next = new Date(y, m - 1, d + 1);
    const today = toDateString(new Date());
    if (toDateString(next) <= today) {
      setSelectedDate(toDateString(next));
    }
  };

  const addHighlight = useCallback((id: number, setter: typeof setHighlightedIds) => {
    setter((prev) => new Set(prev).add(id));
    const timer = setTimeout(() => {
      setter((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      highlightTimers.current.delete(id);
    }, 2000);
    highlightTimers.current.set(id, timer);
  }, []);

  const handleToggle = useCallback((id: number) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    if (todo.completed) {
      // Uncompleting: play fade-out animation, then toggle
      setUncompletingIds((prev) => new Set(prev).add(id));

      setTimeout(() => {
        toggleTodo(id);
        setUncompletingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        // After refetch, highlight in incomplete list
        setTimeout(() => {
          addHighlight(id, setHighlightedIncompleteIds);
        }, 500);
      }, 800);
      return;
    }

    // Completing: play fade-out animation, then toggle
    setCompletingIds((prev) => new Set(prev).add(id));

    setTimeout(() => {
      toggleTodo(id);
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      // Ensure completed section is visible and date is today
      setShowCompleted(true);
      setSelectedDate(toDateString(new Date()));

      // After refetch, highlight in completed list
      setTimeout(() => {
        addHighlight(id, setHighlightedIds);
      }, 500);
    }, 800);
  }, [todos, toggleTodo, addHighlight]);

  // Cleanup highlight timers
  useEffect(() => {
    return () => {
      highlightTimers.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !authStorage.isLoggedIn()) {
      router.push("/login");
    }
  }, [authLoading, router]);

  if (authLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-[var(--text-sub)]">로딩 중...</p>
      </main>
    );
  }

  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = completedQuery.data ?? [];
  const isToday = selectedDate === toDateString(new Date());

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Suspense fallback={null}>
        <OAuthTokenHandler />
      </Suspense>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Todo List</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-sub)]">{user.name}</span>
          <button
            onClick={toggleTheme}
            className="rounded p-1.5 text-[var(--text-sub)] transition hover:bg-[var(--surface2)] hover:text-[var(--text)]"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={logout}
            className="rounded p-1.5 text-[var(--text-sub)] transition hover:bg-[var(--surface2)] hover:text-[var(--text)]"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* 할 일 추가 */}
      <div className="mb-6">
        <button
          onClick={() => setIsCreateModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 font-medium text-white transition hover:opacity-90"
        >
          <Plus size={18} />
          새로운 할 일 추가
        </button>
      </div>

      {/* 미완료 목록 */}
      {todosLoading ? (
        <div className="py-12 text-center text-[var(--text-sub)]">로딩 중...</div>
      ) : (
        <>
          <TodoList
            todos={incompleteTodos}
            completingIds={completingIds}
            highlightedIds={highlightedIncompleteIds}
            highlightColor="violet"
            onToggle={handleToggle}
            onDetail={setDetailTodoId}
            onDelete={deleteTodo}
          />
          <div className="mt-4 text-center text-sm text-[var(--text-sub)]">
            {incompleteTodos.length}개 남음
          </div>
        </>
      )}

      {/* 완료된 업무 섹션 */}
      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-lg font-semibold transition hover:text-[var(--accent)]"
          >
            완료된 업무 {showCompleted ? "▾" : "▸"}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevDate}
              className="rounded p-1 text-[var(--text-sub)] transition hover:bg-[var(--surface2)] hover:text-[var(--text)]"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                max={toDateString(new Date())}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <span className="text-sm font-medium text-[var(--accent)]">
                {formatDisplay(selectedDate)}
              </span>
            </div>

            <button
              onClick={handleNextDate}
              disabled={isToday}
              className={`rounded p-1 transition ${
                isToday
                  ? "text-[var(--border)]"
                  : "text-[var(--text-sub)] hover:bg-[var(--surface2)] hover:text-[var(--text)]"
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {showCompleted && (
          completedQuery.isLoading ? (
            <div className="py-6 text-center text-sm text-[var(--text-sub)]">로딩 중...</div>
          ) : completedTodos.length === 0 ? (
            <div className="py-6 text-center text-sm text-[var(--text-sub)]">
              {formatDisplay(selectedDate)}에 완료된 업무가 없습니다.
            </div>
          ) : (
            <>
              <TodoList
                todos={completedTodos}
                completingIds={uncompletingIds}
                highlightedIds={highlightedIds}
                onToggle={handleToggle}
                onDetail={setDetailTodoId}
                onDelete={deleteTodo}
              />
              <div className="mt-3 text-center text-sm text-[var(--text-sub)]">
                {completedTodos.length}개 완료
              </div>
            </>
          )
        )}
      </div>

      {/* 모달 */}
      {isCreateModal && (
        <TodoDetailModal
          todoId={null}
          isCreate
          onClose={() => setIsCreateModal(false)}
          onCreate={createTodo}
        />
      )}

      {detailTodoId !== null && (
        <TodoDetailModal
          todoId={detailTodoId}
          onClose={() => setDetailTodoId(null)}
          onSave={updateTodo}
        />
      )}
    </main>
  );
}
