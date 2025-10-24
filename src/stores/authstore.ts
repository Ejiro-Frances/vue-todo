import { defineStore } from "pinia";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
  }),

  actions: {
    setUser(user: User) {
      this.user = user;
    },

    setAccessToken(accessToken: string) {
      this.accessToken = accessToken;
    },

    setRefreshToken(refreshToken: string) {
      this.refreshToken = refreshToken;
    },

    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
    },
  },

  persist: true,
});
