<template>
  <div class="min-h-screen flex flex-col bg-gray-5 mt-20 md:mt-28">
    <Header />

    <div
      v-if="!isOnline"
      class="bg-red-600 text-white text-center py-2 fixed top-0 left-0 w-full z-50"
    >
      You are offline. Viewing cached tasks.
    </div>

    <main class="py-10 w-full max-w-[95%] mx-auto">
      <!-- Add Task Button -->
      <div class="fixed top-24 right-5 z-50 shadow-2xl backdrop-blur-3xl">
        <Button @click="isModalOpen = true">Add Task</Button>
      </div>

      <!-- Sync Button -->
      <div class="fixed top-24 left-5 z-50 shadow-2xl backdrop-blur-3xl">
        <Button @click="syncTasks" :disabled="isSyncing" variant="secondary">
          {{ isSyncing ? "Syncing..." : "Sync Tasks" }}
        </Button>
      </div>

      <!-- Filter + Search Bar -->
      <TaskFilterButtons
        :activeFilter="activeFilter"
        :setActiveFilter="(val) => (activeFilter = val)"
        :counts="statusCounts"
        :searchQuery="searchQuery"
        :handleSearchChange="handleSearchChange"
        :handleClearSearch="handleClearSearch"
      />

      <!-- Add Task Modal -->
      <TaskFormModal
        :onCreateTask="createMutation.mutateAsync"
        :isOpen="isModalOpen"
        :setIsOpen="(val) => (isModalOpen = val)"
      />

      <!-- Loading Skeleton -->
      <template v-if="isLoading">
        <Skeleton
          v-for="idx in 4"
          :key="idx"
          class="h-28 w-full rounded-xl bg-black/10 dark:bg-gray-500 mb-4"
        />
      </template>

      <!-- Task List -->
      <template v-else-if="paginationData.currentTasks.length > 0">
        <TaskList
          :tasks="paginationData.currentTasks"
          :editingTaskId="editingTask"
          :editForms="editForms"
          :onEditChange="handleEditChange"
          :onSaveEdit="handleSaveEdit"
          :onCancelEdit="handleCancelEdit"
          :onEdit="handleEditTask"
          :onDelete="handleDeleteTask"
          :onToggle="handleToggleTask"
          :updatingTaskId="updatingTaskId"
          :deletingTaskId="deletingTaskId"
        />
      </template>

      <!-- No Tasks -->
      <div v-else class="text-center text-gray-500 py-6">
        {{
          debouncedSearch
            ? `No tasks found matching "${debouncedSearch}".`
            : `No ${activeFilter.toLowerCase()} tasks.`
        }}
      </div>

      <!-- Pagination -->
      <PaginationControls
        v-if="paginationData.totalPages > 1"
        :currentPage="currentPage"
        :totalPages="paginationData.totalPages"
        :onPageChange="(page) => (currentPage = page)"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import Header from "@/components/header/Header.vue";
import { useOnlineStatus } from "@/composables/useOnlineStatus";
import { useTaskSync } from "@/composables/useTaskSync";

import { ref, computed, watch, onMounted } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { useAuthGuard } from "@/composables/useAuthGuard";
import { getTasks } from "@/services/taskservices";
import { useTaskOperations } from "@/composables/useTaskOperations";
import { paginationConfig } from "@/constants/pagination-config";
import { getTasksFromStorage, saveTasksToStorage } from "@/lib/storage";
import { useNotificationStore } from "@/stores/useNotificationstore";

import TaskList from "@/components/tasks/TaskList.vue";
import TaskFilterButtons from "@/components/tasks/TaskFilterButtons.vue";
import PaginationControls from "@/components/tasks/PaginationControls.vue";
import TaskFormModal from "@/components/tasks/TaskModal.vue";
import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";

// Auth Guard
// useAuthGuard({ requireAuth: true });

// Types
type ActiveFilter = "ALL" | "TODO" | "IN_PROGRESS" | "DONE";

const notificationStore = useNotificationStore();
const addNotification = notificationStore.addNotification;

// 🔧 State
const isModalOpen = ref(false);
const activeFilter = ref<ActiveFilter>("ALL");
const searchQuery = ref("");
const debouncedSearch = ref("");

// Pagination
const currentPage = ref(1);
const tasksPerPage = ref(paginationConfig.DEFAULT_TASKS_PER_PAGE);

// Reset to page 1 when filtering or searching
watch([activeFilter, debouncedSearch], () => {
  currentPage.value = 1;
});

// 🧩 Task operations composable
const {
  editingTask,
  editForms,
  updatingTaskId,
  deletingTaskId,
  handleToggleTask,
  handleDeleteTask,
  handleEditTask,
  handleSaveEdit,
  handleCancelEdit,
  createMutation,
  handleEditChange,
} = useTaskOperations({
  page: currentPage as any,
  limit: tasksPerPage as any,
  status: activeFilter as any,
  search: debouncedSearch as any,
});

// 🕐 Debounce search
let debounceTimer: number;
watch(searchQuery, (newVal) => {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    debouncedSearch.value = newVal;
  }, 300);
});

// 🗂️ Fetch tasks (with offline fallback)
const { data: taskResponse, isLoading } = useQuery({
  queryKey: ["tasks", currentPage, tasksPerPage, activeFilter, debouncedSearch],
  queryFn: async () => {
    try {
      const response = await getTasks(
        currentPage.value,
        tasksPerPage.value,
        activeFilter.value,
        debouncedSearch.value
      );
      await saveTasksToStorage({
        data: response.data,
        meta: response.meta ?? {
          total: 0,
          limit: tasksPerPage.value,
          page: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });
      return response;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      const cached = await getTasksFromStorage();
      if (cached) {
        addNotification({
          type: "warning",
          message: "You are offline, showing cached tasks",
        });
        return cached;
      }
      throw new Error("Unable to fetch tasks.");
    }
  },
  retry: 1,
  staleTime: 1000 * 60 * 5,
});

// 🧮 Computed
const tasks = computed(() => taskResponse.value?.data ?? []);
const defaultMeta = {
  total: 0,
  limit: paginationConfig.DEFAULT_TASKS_PER_PAGE,
  page: 1,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};
const meta = computed(() => taskResponse.value?.meta ?? defaultMeta);

// Query for all tasks to get accurate counts.
// This fetches up to 9999 tasks to provide accurate counts for the filter buttons.
// This is a client-side workaround for the API not providing total counts.
const { data: allTasksResponse } = useQuery({
  queryKey: ["tasks", "all-for-counts"],
  queryFn: () => getTasks(1, 9999, "ALL", ""),
  staleTime: 1000 * 60 * 5, // 5 minutes
  retry: 1,
});

// Status counts
const statusCounts = computed(() => {
  const allTasks = allTasksResponse.value?.data ?? [];
  const counts = {
    ALL: allTasks.length,
    TODO: 0,
    IN_PROGRESS: 0,
    DONE: 0,
  };
  for (const t of allTasks) {
    if (counts[t.status] !== undefined) {
      counts[t.status]++;
    }
  }
  return counts;
});

// Pagination data
const paginationData = computed(() => ({
  currentTasks: tasks.value,
  totalPages: meta.value.totalPages ?? 1,
  hasNextPage: meta.value.hasNextPage ?? false,
  hasPreviousPage: meta.value.hasPreviousPage ?? false,
}));

// Search handlers
const handleSearchChange = (e: Event) => {
  const target = e.target as HTMLInputElement;
  searchQuery.value = target.value;
};
const handleClearSearch = () => (searchQuery.value = "");

// 🛰️ Online / Offline sync
const { isSyncing, syncTasks } = useTaskSync();
const isOnline = useOnlineStatus(() => {
  addNotification({
    type: "info",
    message: "Reconnected — syncing latest tasks...",
  });
});
</script>
