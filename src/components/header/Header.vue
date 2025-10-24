<template>
  <header
    :class="[
      'fixed top-0 left-0 w-full h-20 z-50 py-4 transition-all duration-300 bg-transparent',
      isScrolled ? 'bg-[rgba(245,245,245,0.1)] shadow-md backdrop-blur-sm' : '',
    ]"
  >
    <div
      :class="[
        'flex justify-between max-w-[95%] mx-auto px-5 py-2 border border-[#F4EDED] rounded',
        isScrolled ? 'border-none' : '',
      ]"
    >
      <!-- Logo -->
      <RouterLink to="/all-tasks" class="flex gap-2 items-center">
        <img src="/logo.svg" alt="logo" class="h-5 w-5" />
        <p class="text-[#001633] dark:text-blue-300 md:text-2xl font-bold">
          To-Do
        </p>
      </RouterLink>

      <div class="flex items-center gap-4">
        <!-- Notification Bell -->
        <NotificationBell />

        <!-- Avatar Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" class="flex items-center gap-2">
              <Avatar class="h-8 w-8">
                <AvatarFallback>
                  {{ user?.name ? user.name.charAt(0).toUpperCase() : "U" }}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" class="w-56">
            <DropdownMenuLabel>
              <div>
                <p class="font-semibold">{{ user?.name || "User" }}</p>
                <p class="text-sm text-gray-500">{{ user?.email || "—" }}</p>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              @click="handleLogout"
              class="text-red-600 focus:text-red-600"
            >
              <LogOut class="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authstore";

// shadcn-vue components
import DropdownMenu from "../ui/dropdown-menu/DropdownMenu.vue";
import DropdownMenuItem from "../ui/dropdown-menu/DropdownMenuItem.vue";
import DropdownMenuTrigger from "../ui/dropdown-menu/DropdownMenuTrigger.vue";
import DropdownMenuContent from "../ui/dropdown-menu/DropdownMenuContent.vue";
import DropdownMenuLabel from "../ui/dropdown-menu/DropdownMenuLabel.vue";
import DropdownMenuSeparator from "../ui/dropdown-menu/DropdownMenuSeparator.vue";

import Avatar from "../ui/avatar/Avatar.vue";
import AvatarFallback from "../ui/avatar/AvatarFallback.vue";
import Button from "../ui/button/Button.vue";

// icons
import { LogOut } from "lucide-vue-next";

// custom components
// import notification from "./Notification.vue";

const router = useRouter();
const authStore = useAuthStore();
const { user, logout } = authStore;

const isScrolled = ref(false);

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

const handleLogout = () => {
  logout();
  router.push("/");
};
</script>
