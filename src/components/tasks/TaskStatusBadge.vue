<template>
  <div class="flex gap-1 items-center">
    <p v-if="label" class="font-family-DM text-[#888888] text-sm mr-1.5">
      {{ label }}
    </p>

    <div>
      <CircleCheck
        v-if="status === 'DONE'"
        class="fill-[#0EA420] text-white"
        :size="18"
      />
      <Loader v-else class="fill-[#F42D2D] animate-spin-slow" :size="18" />
    </div>

    <span
      class="capitalize text-sm"
      :class="status === 'DONE' ? 'text-[#0EA420]' : 'text-[#F42D2D]'"
    >
      {{ formatStatus }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Loader, CircleCheck } from "lucide-vue-next";
import type { Status } from "@/types";

const props = defineProps<{
  status: Status;
  label?: string;
}>();

// Format status text for display
const formatStatus = computed(() =>
  props.status.toLowerCase().replace("_", " ")
);
</script>

<style scoped>
/* optional slower spin animation */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 2s linear infinite;
}
</style>
