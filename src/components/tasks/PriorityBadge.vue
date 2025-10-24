<template>
  <div class="flex gap-2 font-family-DM text-[#888888] text-sm">
    <p v-if="label">{{ label }}</p>

    <div :class="['flex gap-1 items-center text-xs', colorMap[priority]]">
      <ChartNoAxesColumn class="w-4 h-4" />
      <span class="capitalize">{{ priority.toLowerCase() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChartNoAxesColumn } from "lucide-vue-next";

// ✅ Explicitly type the props
const props = defineProps<{
  priority: "LOW" | "MEDIUM" | "HIGH";
  label?: string;
}>();

// ✅ Use props.priority safely
const colorMap: Record<typeof props.priority, string> = {
  LOW: "text-[#0EA420]",
  MEDIUM: "text-purple-700",
  HIGH: "text-red-700",
};
</script>
