<template>
  <div
    class="max-w-[95%] md:max-w-full md:mb-10 mx-auto lg:bg-[#FBFBFB] dark:lg:bg-gray-600 rounded-2xl lg:rounded-[4rem] py-3 px-4 lg:px-5 flex flex-col lg:flex-row gap-5 lg:gap-10 items-center"
  >
    <!-- Filter Buttons -->
    <div
      class="flex-1 flex gap-2 justify-between overflow-auto bg-[#FBFBFB] dark:lg:bg-gray-600 lg:bg-transparent px-5"
    >
      <button
        v-for="status in filters"
        :key="status"
        @click="() => onFilterClick(status)"
        class="flex items-center px-4 py-2 font-medium transition-all duration-150"
        :class="{ 'border-r-4 border-[#D9D9D9]': activeFilter === status }"
      >
        <span
          class="mr-1.5 md:mr-4 text-[0.625rem] lg:text-lg font-semibold capitalize"
          :class="{
            'text-[#004299] dark:text-blue-200': activeFilter === status,
            'text-[#999999]': activeFilter !== status,
          }"
        >
          {{ status === "ALL" ? "ALL" : status.replace("_", " ") }}
        </span>

        <span
          class="w-5 md:w-7 h-5 md:h-7 text-[0.625rem] md:text-sm align-middle py-1 text-white rounded-full flex justify-center items-center"
          :class="{
            'bg-[#004299]': activeFilter === status,
            'bg-[#D9D9D9]': activeFilter !== status,
          }"
        >
          {{ status === "ALL" ? counts.ALL : counts[status] }}
        </span>
      </button>
    </div>

    <!-- Search Input -->
    <div class="relative w-[90%] lg:max-w-140 lg:ml-auto">
      <Input
        placeholder="Search tasks by title, description, or tags..."
        :value="searchQuery"
        @input="onSearchInput"
        class="py-5 px-10 shadow placeholder:text-[#333333] text-[#1a1a1a] dark:text-gray-100 dark:placeholder:text-gray-100 rounded-4xl"
      />

      <!-- Clear Button -->
      <button
        v-if="searchQuery"
        @click="onClearClick"
        class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
        aria-label="Clear search"
      >
        <X class="w-6 h-6" />
      </button>

      <!-- Search Icon -->
      <div
        class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
      >
        <Search class="w-5 h-5" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Search, X } from "lucide-vue-next";
import Input from "../ui/input/Input.vue";

type ActiveFilter = "ALL" | "TODO" | "IN_PROGRESS" | "DONE";

const props = defineProps<{
  activeFilter: ActiveFilter;
  setActiveFilter: (status: ActiveFilter) => void;
  counts: Record<ActiveFilter, number>;
  searchQuery: string;
  handleSearchChange: (e: Event) => void;
  handleClearSearch: (e: Event) => void;
}>();

const filters = computed<ActiveFilter[]>(() => [
  "ALL",
  "TODO",
  "IN_PROGRESS",
  "DONE",
]);

// Wrapper functions to ensure correct event typing
function onFilterClick(status: ActiveFilter) {
  props.setActiveFilter(status);
}

function onSearchInput(event: Event) {
  props.handleSearchChange(event);
}

function onClearClick(event: MouseEvent) {
  props.handleClearSearch(event);
}
</script>
