<template>
  <div class="relative bg-background rounded-xl mb-4 hover:shadow-2xs">
    <!-- Edit form modal -->
    <div
      v-if="isEditing"
      class="bg-[rgba(0,0,0,0.6)] fixed z-50 top-0 left-0 w-full h-full flex justify-center items-center"
    >
      <EditTaskForm
        :editForm="editForm"
        :onChange="onChange"
        :onSave="onSave"
        :onCancel="onCancel"
        class="bg-background rounded-md"
      />
    </div>

    <!-- Task Item -->
    <div v-else class="relative" :class="className">
      <div class="pb-4 border-b-2">
        <div class="flex justify-between items-center">
          <h3
            :class="[
              'text-xl font-medium capitalize',
              task.status === 'DONE'
                ? 'line-through text-gray-500 dark:text-gray-100'
                : '',
            ]"
          >
            {{ task.name }}
          </h3>

          <div class="flex items-center gap-2">
            <!-- Mark Complete -->
            <div class="relative group">
              <input
                type="checkbox"
                :checked="task.status === 'DONE'"
                @change="onToggle"
                class="shrink-0 rounded-full cursor-pointer"
              />
              <span
                class="absolute left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-1"
              >
                Mark complete
              </span>
            </div>

            <!-- Dropdown Menu -->
            <div class="relative">
              <button @click="toggleMenu" class="p-1">
                <EllipsisVertical size="24" />
              </button>

              <div
                v-if="menuOpen"
                class="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-md z-50"
              >
                <button
                  @click="handleEdit"
                  :disabled="isBusy"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left"
                >
                  <Pencil size="18" />
                  <span>Edit</span>
                </button>

                <hr />

                <button
                  @click="handleDelete"
                  :disabled="isBusy"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 w-full text-left"
                >
                  <Trash2 size="18" />
                  <span>Delete</span>
                </button>

                <hr />

                <RouterLink
                  :to="`/all-tasks/${task.id}`"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-100"
                >
                  <PanelLeftOpen />
                  <span>View task</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <p
          v-if="task.description"
          class="truncate text-sm tracking-normal capitalize text-gray-700 dark:text-gray-300 mt-1 max-w-[450px]"
        >
          {{ task.description }}
        </p>
      </div>

      <!-- Status / Priority -->
      <div class="flex flex-col gap-1 justify-center mt-3">
        <div class="flex justify-between items-center">
          <div class="flex gap-1 items-center text-xs">
            <ChartNoAxesColumn />
            <span class="capitalize">{{ task.priority.toLowerCase() }}</span>
          </div>

          <span
            v-if="task.tags"
            class="text-blue-800 dark:text-blue-200 font-semibold capitalize text-xs"
          >
            {{ task.tags }}
          </span>
        </div>

        <TaskStatusBadge :status="task.status" />
      </div>

      <!-- Timestamp -->
      <div class="flex-1">
        <div class="flex justify-between">
          <div
            class="mt-4 flex flex-wrap gap-4 items-center text-xs text-gray-600 dark:text-gray-200"
          >
            <span>{{ formattedDate }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { RouterLink } from "vue-router";
import TaskStatusBadge from "./TaskStatusBadge.vue";
import EditTaskForm from "./EditTaskForm.vue";

import {
  EllipsisVertical,
  Pencil,
  Trash2,
  PanelLeftOpen,
  ChartNoAxesColumn,
} from "lucide-vue-next";

const props = defineProps({
  task: Object,
  isEditing: Boolean,
  editForm: Object,
  onChange: Function,
  onSave: Function,
  onCancel: Function,
  onEdit: Function,
  onDelete: Function,
  onToggle: Function,
  isBusy: Boolean,
  className: String,
});

const menuOpen = ref(false);
const toggleMenu = () => (menuOpen.value = !menuOpen.value);
const handleEdit = () => {
  props.onEdit();
  menuOpen.value = false;
};
const handleDelete = () => {
  props.onDelete();
  menuOpen.value = false;
};

const formattedDate = computed(() => {
  return new Date(props.task.createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
});
</script>
