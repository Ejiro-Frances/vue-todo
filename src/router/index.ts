import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import Auth from "@/pages/Auth.vue";
import TaskBoard from "@/pages/TaskBoard.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Auth",
    component: Auth,
  },
  {
    path: "/tasks",
    name: "TaskBoard",
    component: TaskBoard,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
