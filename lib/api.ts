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
    request<{ token: string }>("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
};

export const userApi = {
  getMe: () => request<User>("/api/v1/users/me"),
  updateMe: (name: string) =>
    request<User>("/api/v1/users/me", {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  deleteMe: () => request<null>("/api/v1/users/me", { method: "DELETE" }),
};

export const todoApi = {
  getTodos: () => request<TodoListItem[]>("/api/v1/todos"),

  getTodo: (id: number) => request<Todo>(`/api/v1/todos/${id}`),

  createTodo: (title: string, description?: TiptapJSON | null, dueDate?: string | null) =>
    request<Todo>("/api/v1/todos", {
      method: "POST",
      body: JSON.stringify({ title, description, dueDate }),
    }),

  updateTodo: (id: number, title: string, description?: TiptapJSON | null, dueDate?: string | null) =>
    request<Todo>(`/api/v1/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title, description, dueDate }),
    }),

  toggleTodo: (id: number) =>
    request<Todo>(`/api/v1/todos/${id}/toggle`, { method: "PATCH" }),

  deleteTodo: (id: number) =>
    request<null>(`/api/v1/todos/${id}`, { method: "DELETE" }),

  getCompletedByDate: (date: string) =>
    request<TodoListItem[]>(`/api/v1/todos/completed?date=${date}`),

  getAttachments: (todoId: number) =>
    request<TodoAttachment[]>(`/api/v1/todos/${todoId}/attachments`),

  addAttachment: (todoId: number, data: { fileUrl: string; fileName: string; fileSize: number }) =>
    request<TodoAttachment>(`/api/v1/todos/${todoId}/attachments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deleteAttachment: (todoId: number, attachmentId: number) =>
    request<null>(`/api/v1/todos/${todoId}/attachments/${attachmentId}`, { method: "DELETE" }),
};

export const uploadApi = {
  uploadImage: (file: File) =>
    uploadRequest<UploadResponse>("/api/v1/uploads/image", file),
};
