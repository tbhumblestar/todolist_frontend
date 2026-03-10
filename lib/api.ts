import { ApiResponse, Todo, TodoAttachment, TodoListItem, TiptapJSON, UploadResponse } from "@/types/todo";
import { User } from "@/types/user";
import { authStorage } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  if (res.status === 401) {
    authStorage.removeToken();
    window.location.href = "/login";
    throw new Error("인증이 만료되었습니다.");
  }

  const json: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "요청에 실패했습니다.");
  }

  return json.data;
}

async function uploadRequest<T>(path: string, file: File): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    authStorage.removeToken();
    window.location.href = "/login";
    throw new Error("인증이 만료되었습니다.");
  }

  const json: ApiResponse<T> = await res.json();

  if (!res.ok) {
    throw new Error(json.message || "요청에 실패했습니다.");
  }

  return json.data;
}

export const authApi = {
  signup: (email: string, password: string, name: string) =>
    request<{ token: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

export const userApi = {
  getMe: () => request<User>("/users/me"),
  updateMe: (name: string) =>
    request<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  deleteMe: () => request<null>("/users/me", { method: "DELETE" }),
};

export const todoApi = {
  getTodos: () => request<TodoListItem[]>("/todos"),

  getTodo: (id: number) => request<Todo>(`/todos/${id}`),

  createTodo: (title: string, description?: TiptapJSON | null, dueDate?: string | null) =>
    request<Todo>("/todos", {
      method: "POST",
      body: JSON.stringify({ title, description, dueDate }),
    }),

  updateTodo: (id: number, title: string, description?: TiptapJSON | null, dueDate?: string | null) =>
    request<Todo>(`/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, description, dueDate }),
    }),

  toggleTodo: (id: number) =>
    request<Todo>(`/todos/${id}/toggle`, { method: "PATCH" }),

  deleteTodo: (id: number) =>
    request<null>(`/todos/${id}`, { method: "DELETE" }),

  getCompletedByDate: (date: string) =>
    request<TodoListItem[]>(`/todos/completed?date=${date}`),

  getAttachments: (todoId: number) =>
    request<TodoAttachment[]>(`/todos/${todoId}/attachments`),

  addAttachment: (todoId: number, data: { fileUrl: string; fileName: string; fileSize: number }) =>
    request<TodoAttachment>(`/todos/${todoId}/attachments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteAttachment: (todoId: number, attachmentId: number) =>
    request<null>(`/todos/${todoId}/attachments/${attachmentId}`, { method: "DELETE" }),
};

export const uploadApi = {
  uploadImage: (file: File) =>
    uploadRequest<UploadResponse>("/uploads/image", file),
};
