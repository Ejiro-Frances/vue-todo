<template>
  <div class="space-y-6">
    <p v-if="isLoading" class="text-center">Loading tasks...</p>
    <p v-else-if="isError" class="text-center text-red-500">
      Error fetching tasks.
    </p>

    <template v-else>
      <p v-if="fetchedTasks.length === 0" class="text-center">
        No tasks found.
      </p>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 md:gap-10 mx-5 md:mx-10"
      >
        <TaskItem
          v-for="task in fetchedTasks"
          :key="task.id"
          :task="task"
          :isEditing="editingTaskId === task.id"
          :editForm="
            editForms[task.id] || {
              name: task.name,
              description: task.description,
              priority: task.priority,
              status: task.status,
              tags: task.tags,
            }
          "
          :onChange="(field, value) => onEditChange(task.id, field, value)"
          :onSave="() => onSaveEdit(task.id)"
          :onCancel="onCancelEdit"
          :onEdit="() => onEdit(task)"
          :onDelete="() => onDelete(task.id)"
          :onToggle="() => onToggle(task)"
          :isBusy="updatingTaskId === task.id || deletingTaskId === task.id"
          :class="[
            'h-full px-4 py-5 border border-l-8 rounded-xl',
            task.status === 'DONE'
              ? 'border-[#0EA420]'
              : task.status === 'TODO'
              ? 'border-[#F42D2D]'
              : 'border-purple-600',
          ]"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import TaskItem from "./TaskItem.vue";
import { getTasks } from "@/services/taskservices";

// Props
const props = defineProps({
  editingTaskId: String,
  editForms: Object,
  onEditChange: Function,
  onSaveEdit: Function,
  onCancelEdit: Function,
  onEdit: Function,
  onDelete: Function,
  onToggle: Function,
  updatingTaskId: String,
  deletingTaskId: String,
});

// State
const page = ref(1);

// Query
const { data, isLoading, isError } = useQuery({
  queryKey: ["tasks", page],
  queryFn: () => getTasks(page.value),
});

// Computed
const fetchedTasks = computed(() => data.value?.data ?? []);
</script>
