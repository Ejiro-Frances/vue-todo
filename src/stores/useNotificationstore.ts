import { defineStore } from "pinia";
import { v4 as uuid } from "uuid";

export type Notification = {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  action?: () => void;
  read: boolean;
};

type NotificationState = {
  notifications: Notification[];
};

export const useNotificationStore = defineStore("notification", {
  state: (): NotificationState => ({
    notifications: [],
  }),

  actions: {
    addNotification(n: Omit<Notification, "id" | "read">) {
      this.notifications.unshift({
        id: uuid(),
        read: false,
        ...n,
      });
    },

    markAsRead(id: string) {
      this.notifications = this.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
    },

    clearAll() {
      this.notifications = [];
    },
  },
});
