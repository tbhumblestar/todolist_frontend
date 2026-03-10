import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoApi, uploadApi } from "@/lib/api";

export const useAttachments = (todoId: number | null) => {
  const queryClient = useQueryClient();
  const queryKey = ["attachments", todoId];

  const attachmentsQuery = useQuery({
    queryKey,
    queryFn: () => todoApi.getAttachments(todoId!),
    enabled: todoId !== null,
  });

  const addMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadApi.uploadImage(file);
      return todoApi.addAttachment(todoId!, {
        fileUrl: uploaded.url,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId: number) => todoApi.deleteAttachment(todoId!, attachmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["todo", todoId] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return {
    attachments: attachmentsQuery.data ?? [],
    isLoading: attachmentsQuery.isLoading,
    addAttachment: addMutation.mutate,
    isUploading: addMutation.isPending,
    deleteAttachment: deleteMutation.mutate,
  };
};
