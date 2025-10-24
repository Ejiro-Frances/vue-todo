import { ref, watch } from "vue";
import { useOnlineStatus } from "@/composables/useOnlineStatus";
import { getTasksFromStorage, saveTasksToStorage } from "@/lib/storage";
import { getTasks } from "@/services/taskservices";
import { toast } from "vue-sonner";
import type { TaskApiResponse } from "@/types";

export function useTaskSync() {
  const isSyncing = ref(false);
  const isOnline = useOnlineStatus();

  // Automatically trigger sync when coming back online
  watch(isOnline, async (online) => {
    if (online) {
      await syncTasks();
    }
  });

  const syncTasks = async () => {
    try {
      isSyncing.value = true;
      toast.info("Reconnecting… Syncing tasks");
      const response = await getTasks(1, 10, "ALL", "");
      await saveTasksToStorage(response as TaskApiResponse);
      toast.success("Tasks synced successfully");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      toast.error(`Failed to sync tasks: ${message}`);
    } finally {
      isSyncing.value = false;
    }
  };

  // Optionally call manually
  return { isSyncing, syncTasks };
}
