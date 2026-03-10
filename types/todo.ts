export interface TiptapJSON {
  type: "doc";
  content: TiptapNode[];
}

export interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: Record<string, unknown>;
}

export interface TodoAttachment {
  id: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
}

export interface Todo {
  id: number;
  title: string;
  description: TiptapJSON | null;
  completed: boolean;
  dueDate: string | null;
  attachments: TodoAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface TodoListItem {
  id: number;
  title: string;
  completed: boolean;
  dueDate: string | null;
  attachmentCount: number;
  thumbnailUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  code?: string;
}
