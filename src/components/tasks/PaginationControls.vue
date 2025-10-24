<template>
  <div class="mt-6">
    <Pagination>
      <PaginationContent>
        <!-- Previous -->
        <PaginationItem>
          <PaginationPrevious
            href="#"
            @click.prevent="handlePrev"
            :class="{ 'pointer-events-none opacity-50': currentPage <= 1 }"
          />
        </PaginationItem>

        <!-- Page Numbers -->
        <PaginationItem v-for="(item, index) in paginationItems" :key="index">
          <template v-if="item === 'ellipsis'">
            <PaginationEllipsis />
          </template>
          <template v-else>
            <PaginationLink
              href="#"
              @click.prevent="() => onPageChange(item)"
              :is-active="item === currentPage"
            >
              {{ item }}
            </PaginationLink>
          </template>
        </PaginationItem>

        <!-- Next -->
        <PaginationItem>
          <PaginationNext
            href="#"
            @click.prevent="handleNext"
            :class="{
              'pointer-events-none opacity-50': currentPage >= totalPages,
            }"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>

    <!-- Keyboard navigation hint -->
    <div class="text-xs text-gray-500 text-center mt-2">
      Use ← → arrow keys, Home/End for navigation
    </div>
  </div>
</template>

<script setup lang="ts">
import Pagination from "../ui/pagination/Pagination.vue";
import PaginationContent from "../ui/pagination/PaginationContent.vue";
import PaginationEllipsis from "../ui/pagination/PaginationEllipsis.vue";
import PaginationItem from "../ui/pagination/PaginationItem.vue";
import PaginationNext from "../ui/pagination/PaginationNext.vue";
import PaginationPrevious from "../ui/pagination/PaginationPrevious.vue";
import { paginationConfig } from "@/constants/pagination-config";
import { computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  onPageChange: { type: Function, required: true },
});

const getPaginationItems = () => {
  const items = [];

  if (props.totalPages <= paginationConfig.MAX_VISIBLE_PAGES) {
    for (let i = 1; i <= props.totalPages; i++) items.push(i);
  } else {
    if (props.currentPage <= 3) {
      for (let i = 1; i <= 4; i++) items.push(i);
      items.push("ellipsis", props.totalPages);
    } else if (props.currentPage >= props.totalPages - 2) {
      items.push(1, "ellipsis");
      for (let i = props.totalPages - 3; i <= props.totalPages; i++)
        items.push(i);
    } else {
      items.push(1, "ellipsis");
      for (let i = props.currentPage - 1; i <= props.currentPage + 1; i++)
        items.push(i);
      items.push("ellipsis", props.totalPages);
    }
  }

  return items;
};

const paginationItems = computed(() => getPaginationItems());

// --- Handlers ---
const handlePrev = () => {
  if (props.currentPage > 1) props.onPageChange(props.currentPage - 1);
};

const handleNext = () => {
  if (props.currentPage < props.totalPages)
    props.onPageChange(props.currentPage + 1);
};

// --- Keyboard Navigation (← → Home End) ---
const handleKeydown = (e) => {
  if (e.key === "ArrowLeft") handlePrev();
  if (e.key === "ArrowRight") handleNext();
  if (e.key === "Home") props.onPageChange(1);
  if (e.key === "End") props.onPageChange(props.totalPages);
};

onMounted(() => window.addEventListener("keydown", handleKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", handleKeydown));
</script>
