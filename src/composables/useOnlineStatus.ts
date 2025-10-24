// composables/useOnlineStatus.js
import { ref, onMounted, onUnmounted } from "vue";

export function useOnlineStatus(onReconnect) {
  const isOnline = ref(navigator.onLine);

  const handleOnline = () => {
    isOnline.value = true;
    if (onReconnect) onReconnect();
  };

  const handleOffline = () => {
    isOnline.value = false;
  };

  onMounted(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  });

  onUnmounted(() => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  });

  return { isOnline };
}
