import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (token: string, user: User) => {
        // Armazena cookie de sessão para o middleware do Next.js (24 horas)
        Cookies.set("pa_token", token, { expires: 1, path: "/" });
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        Cookies.remove("pa_token", { path: "/" });
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: "personal-assistant-auth",
    }
  )
);
