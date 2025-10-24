<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <div class="relative cursor-pointer border rounded-full p-1.5">
        <Bell class="h-6 w-6" />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full"
        >
          {{ unreadCount }}
        </span>
      </div>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-80">
      <DropdownMenuLabel class="flex justify-between items-center">
        <span>Notifications</span>
        <Button
          v-if="notifications.length > 0"
          size="sm"
          variant="ghost"
          @click="clearAll"
          class="text-xs"
        >
          Clear All
        </Button>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuItem
        v-if="notifications.length === 0"
        class="text-gray-500 text-sm"
      >
        No notifications
      </DropdownMenuItem>

      <DropdownMenuItem
        v-else
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'flex justify-between items-center text-sm',
          notification.type === 'error' ? 'text-red-600' : 'text-green-600',
        ]"
        @click="markAsRead(notification.id)"
      >
        <span>{{ notification.message }}</span>
        <Button
          v-if="notification.action"
          size="icon"
          variant="ghost"
          @click.stop="notification.action?.()"
        >
          <RotateCcw class="h-4 w-4" />
        </Button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Bell, RotateCcw } from "lucide-vue-next";
import Button from "@/components/ui/button/Button.vue";
import DropdownMenu from "../ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuItem from "../ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuContent from "../ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuLabel from "../ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuSeparator from "../ui/dropdown-menu/DropdownMenuSeparator.vue";
import DropdownMenuTrigger from "../ui/dropdown-menu/DropdownMenuTrigger.vue";
import { useNotificationStore } from "@/stores/useNotificationstore";

const notificationStore = useNotificationStore();
const { notifications, markAsRead, clearAll } = notificationStore;

const unreadCount = computed(() => notifications.filter((n) => !n.read).length);
</script>
