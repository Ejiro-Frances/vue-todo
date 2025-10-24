import { ref, reactive } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";
import { createTask, updateTask, deleteTask } from "@/services/taskservices";
import { saveTasksToStorage } from "@/lib/storage";
import { useNotificationStore } from "@/stores/useNotificationstore";

interface Params {
  page: number;
  limit: number;
  status?: string;
  search?: string;
}

export function useTaskOperations(params: Params) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();
  const queryKey = ["tasks", params];

  // ✅ Reactive state
  const editingTask = ref<string | null>(null);
  const editForms = reactive<Record<string, any>>({});
  const updatingTaskId = ref<string | null>(null);
  const deletingTaskId = ref<string | null>(null);

  // ✅ Cache & LocalStorage updater
  const updateCacheAndStorage = async (updater: (old: any[]) => any[]) => {
    const oldData = queryClient.getQueryData(queryKey) as {
      data: any[];
      meta: any;
    } | null;

    if (oldData) {
      const newData = {
        data: updater(oldData.data),
        meta: oldData.meta,
      };
      queryClient.setQueryData(queryKey, newData);
      await saveTasksToStorage(newData);
    }
  };

  // ✅ Create task
  const createMutation = useMutation({
    mutationFn: (newTask: any) => createTask(newTask),
    onSuccess: async (created: any) => {
      const newTask = {
        ...created,
        createdAt: created.createdAt ?? new Date().toISOString(),
        updatedAt: created.updatedAt ?? new Date().toISOString(),
      };

      await updateCacheAndStorage((old) => [newTask, ...old]);
      addNotification({
        type: "success",
        message: `Task "${created.name}" created successfully`,
      });
    },
  });

  // ✅ Update task
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      updateTask(id, updates),
    onSuccess: async (updated: any) => {
      await updateCacheAndStorage((old) =>
        old.map((task) => (task.id === updated.id ? updated : task))
      );
      addNotification({
        type: "info",
        message: `Task "${updated.name}" updated successfully`,
      });
    },
  });

  // ✅ Delete task
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: async (_, id) => {
      await updateCacheAndStorage((old) => old.filter((t) => t.id !== id));
      addNotification({ type: "error", message: "Task deleted" });
    },
  });

  // ✅ Toggle status (optimistic)
  const handleToggleTask = async (task: any) => {
    const newStatus = task.status === "DONE" ? "TODO" : "DONE";
    const newCompletedAt =
      newStatus === "DONE" ? new Date().toISOString() : null;

    await updateCacheAndStorage((old) =>
      old.map((t) =>
        t.id === task.id
          ? { ...t, status: newStatus, completedAt: newCompletedAt }
          : t
      )
    );

    addNotification({
      type: "info",
      message: `Task "${task.name}" marked as ${newStatus}`,
    });

    try {
      await updateMutation.mutateAsync({
        id: task.id,
        updates: { status: newStatus, completedAt: newCompletedAt },
      });
      toast.success("Synced successfully");
    } catch {
      toast.error("Offline update only. Sync will retry later.");
    }
  };

  // ✅ Delete handler
  const handleDeleteTask = async (taskId: string) => {
    deletingTaskId.value = taskId;
    try {
      await deleteMutation.mutateAsync(taskId);
      toast.success("Task deleted");
    } finally {
      deletingTaskId.value = null;
    }
  };

  // ✅ Edit logic
  const handleEditTask = (task: any) => {
    editingTask.value = task.id;
    editForms[task.id] = {
      name: task.name,
      description: task.description || "",
      tags: task.tags || "",
      priority: task.priority,
      status: task.status,
    };
  };

  const handleSaveEdit = async (taskId: string) => {
    const editForm = editForms[taskId];
    if (!editForm) return;

    updatingTaskId.value = taskId;

    const updates = {
      name: editForm.name.trim(),
      description: editForm.description?.trim() || null,
      tags: editForm.tags?.trim() || null,
      priority: editForm.priority,
      status: editForm.status,
    };

    try {
      await updateMutation.mutateAsync({ id: taskId, updates });
      delete editForms[taskId];
      editingTask.value = null;
    } catch {
      toast.error("Failed to save task changes.");
    } finally {
      updatingTaskId.value = null;
    }
  };

  const handleCancelEdit = () => {
    if (editingTask.value) {
      delete editForms[editingTask.value];
      editingTask.value = null;
    }
  };

  const handleEditChange = (id: string, field: string, value: string) => {
    if (!editForms[id]) editForms[id] = {};
    editForms[id][field] = value;
  };

  return {
    // reactive state
    editingTask,
    editForms,
    updatingTaskId,
    deletingTaskId,

    // mutations
    createMutation,
    updateMutation,
    deleteMutation,

    // computed flags
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // handlers
    handleToggleTask,
    handleDeleteTask,
    handleEditTask,
    handleSaveEdit,
    handleCancelEdit,
    handleEditChange,
  };
}
