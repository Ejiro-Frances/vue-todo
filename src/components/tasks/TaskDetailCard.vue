<template>
  <div class="border border-[#E4E4E7] m-4 p-4 md:p-8 my-28 rounded-md shadow">
    <!-- If currently editing this task -->
    <EditTaskForm
      v-if="editingTask === task.id"
      :editForm="editForms[task.id] || defaultEditForm"
      @change="(field, value) => handleEditChange(task.id, field, value)"
      @save="() => handleSaveEdit(task.id)"
      @cancel="handleCancelEdit"
    />

    <!-- Otherwise, show task details -->
    <div v-else>
      <h2 class="text-xl md:text-[2rem] font-medium text-[#2B7FFF] capitalize">
        {{ task.name }}
      </h2>

      <p v-if="task.description" class="text-gray-700 leading-relaxed mb-4">
        {{ task.description }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <PriorityBadge :priority="task.priority" label="Priority" />

        <span class="md:justify-self-end text-xs text-[#888888]">
          Created:
          {{ formatDate(task.createdAt) }}
        </span>

        <TaskStatusBadge :status="task.status" label="Status" />

        <span
          v-if="task.tags"
          class="md:justify-self-end w-fit text-sm bg-purple-100 text-purple-800 px-3 py-1 rounded-md capitalize"
        >
          Tag: {{ task.tags }}
        </span>
      </div>

      <div class="flex justify-end gap-8 mt-10">
        <Button variant="outline" @click="() => handleEditTask(task)">
          <Pencil class="w-4 h-4" />
          <span>Edit</span>
        </Button>

        <Button variant="destructive" @click="() => (deleteModal = true)">
          <Trash2 class="w-4 h-4" />
          <span>Delete</span>
        </Button>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="deleteModal"
      class="fixed inset-0 bg-black/50 flex justify-center items-center"
    >
      <div class="bg-white rounded-md p-5">
        <p>Are you sure you want to delete?</p>

        <div class="flex gap-4 mt-5">
          <Button
            variant="outline"
            @click="() => (deleteModal = false)"
            class="text-xs"
          >
            No, cancel
          </Button>

          <Button
            @click="() => handleDeleteTask(task.id)"
            variant="destructive"
            class="text-xs"
          >
            Yes, delete
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { formatDate } from "@/lib/utils";
import { toast } from "vue-sonner";

import PriorityBadge from "./PriorityBadge.vue";
import TaskStatusBadge from "./TaskStatusBadge.vue";
import EditTaskForm from "./EditTaskForm.vue";

import { Pencil, Trash2 } from "lucide-vue-next";
import Button from "../ui/button/Button.vue";

import { useTaskOperations } from "@/composables/useTaskOperations";

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});

const deleteModal = ref(false);
const router = useRouter();

const {
  editingTask,
  editForms,
  handleEditTask,
  handleEditChange,
  handleSaveEdit,
  handleCancelEdit,
  handleDeleteTask: originalHandleDeleteTask,
} = useTaskOperations({
  page: 1,
  limit: 10,
  status: undefined,
  search: undefined,
});

// Default edit form structure
const defaultEditForm = {
  name: props.task.name,
  description: props.task.description,
  priority: props.task.priority,
  status: props.task.status,
  tags: props.task.tags,
};

// Format date using date-fns
// const formatDate = (date) => {
//   return format(new Date(date), "MMM d, yyyy • h:mm a");
// };

// Handle delete logic with toast and redirect
const handleDeleteTask = async (taskId) => {
  try {
    await originalHandleDeleteTask(taskId);
    toast.success("Task deleted successfully");
    router.push("/all-tasks");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message || String(error)
        : "An unexpected error occurred while deleting the task.";
    toast.error(`Error deleting task: ${message}`);
  }
};
</script>
