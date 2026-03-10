import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "@/lib/api";
import { TodoListItem, TiptapJSON } from "@/types/todo";
import { authStorage } from "@/lib/auth";
import { PendingAttachment } from "@/components/todo/TodoDetailModal";

const TODOS_KEY = ["todos"];

export const useTodos = () => {
  const queryClient = useQueryClient();

  const todosQuery = useQuery({
    queryKey: TODOS_KEY,
    queryFn: todoApi.getTodos,
    enabled: authStorage.isLoggedIn(),
    staleTime: 1000 * 30,
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, description, dueDate, pendingAttachments }: { title: string; description?: TiptapJSON | null; dueDate?: string | null; pendingAttachments?: PendingAttachment[] }) => {
      const todo = await todoApi.createTodo(title, description, dueDate);
      if (pendingAttachments?.length) {
        await Promise.all(
          pendingAttachments.map((att) =>
            todoApi.addAttachment(todo.id, { fileUrl: att.url, fileName: att.fileName, fileSize: att.fileSize })
          )
        );
      }
      return todo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title, description, dueDate }: { id: number; title: string; description?: TiptapJSON | null; dueDate?: string | null }) =>
      todoApi.updateTodo(id, title, description, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => todoApi.toggleTodo(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TODOS_KEY });
      const previous = queryClient.getQueryData<TodoListItem[]>(TODOS_KEY);

      queryClient.setQueryData<TodoListItem[]>(TODOS_KEY, (old) =>
        old?.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TODOS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY });
      queryClient.invalidateQueries({ queryKey: ["completedTodos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => todoApi.deleteTodo(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TODOS_KEY });
      const previous = queryClient.getQueryData<TodoListItem[]>(TODOS_KEY);

      queryClient.setQueryData<TodoListItem[]>(TODOS_KEY, (old) =>
        old?.filter((todo) => todo.id !== id)
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TODOS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TODOS_KEY });
      queryClient.invalidateQueries({ queryKey: ["completedTodos"] });
    },
  });

  return {
    todos: todosQuery.data ?? [],
    isLoading: todosQuery.isLoading,
    error: todosQuery.error,
    createTodo: createMutation.mutate,
    updateTodo: updateMutation.mutate,
    toggleTodo: toggleMutation.mutate,
    deleteTodo: deleteMutation.mutate,
  };
};
