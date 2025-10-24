import localforage from "localforage";
import { toast } from "vue-sonner"; // ✅ Vue version of sonner
import type { TaskApiResponse } from "@/types";

const TASKS_KEY = "cachedTasks";

// ✅ Save tasks to IndexedDB
export const saveTasksToStorage = async (data: TaskApiResponse) => {
  try {
    await localforage.setItem<TaskApiResponse>(TASKS_KEY, data);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    toast.error(`Error saving tasks: ${message}`);
  }
};

// ✅ Get tasks from IndexedDB
export const getTasksFromStorage =
  async (): Promise<TaskApiResponse | null> => {
    try {
      const cached = await localforage.getItem<TaskApiResponse>(TASKS_KEY);
      return cached ?? null;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Error loading tasks: ${message}`);
      return null;
    }
  };

// ✅ Clear cached tasks
export const clearTasksFromStorage = async () => {
  try {
    await localforage.removeItem(TASKS_KEY);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    toast.error(`Error clearing tasks: ${message}`);
  }
};
