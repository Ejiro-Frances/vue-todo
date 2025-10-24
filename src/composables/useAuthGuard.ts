// composables/useAuthGuard.js
import { watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authstore";

export function useAuthGuard({ requireAuth = false } = {}) {
  const router = useRouter();
  const authStore = useAuthStore();

  watchEffect(() => {
    // Skip in development mode
    if (import.meta.env.MODE !== "production") return;

    const accessToken = authStore.accessToken;

    if (requireAuth && !accessToken) {
      router.replace("/");
    }

    if (!requireAuth && accessToken) {
      router.replace("/all-tasks");
    }
  });
}
