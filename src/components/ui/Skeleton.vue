<template>
  <div
    data-slot="skeleton"
    :class="['bg-accent animate-pulse rounded-md', className]"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  className?: string;
}>();

// If you want, you can apply `cn` just like in React
// const classes = cn("bg-accent animate-pulse rounded-md", props.className);
</script>
