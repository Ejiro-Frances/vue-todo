<template>
  <!-- Global Network Banner -->
  <div
    v-if="showBanner"
    class="fixed top-0 left-0 w-full text-center bg-green-500 text-white p-2"
  >
    Back online!
  </div>
  <div>
    <router-view />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from "vue-sonner";
import { useOnlineStatus } from "@/composables/useOnlineStatus";
import { ref } from "vue";

const showBanner = ref(false);

const { isOnline } = useOnlineStatus(() => {
  showBanner.value = true;
  setTimeout(() => (showBanner.value = false), 3000);
});
</script>
