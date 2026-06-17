"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
  freeClipsRemaining: number;
  login: (email: string) => void;
  logout: () => void;
  useClip: () => boolean;
  resetClips: () => void;
}

const FREE_CLIPS_LIMIT = 15;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      email: null,
      freeClipsRemaining: FREE_CLIPS_LIMIT,
      login: (email: string) =>
        set({ isLoggedIn: true, email, freeClipsRemaining: FREE_CLIPS_LIMIT }),
      logout: () => set({ isLoggedIn: false, email: null }),
      useClip: () => {
        const { freeClipsRemaining } = get();
        if (freeClipsRemaining <= 0) return false;
        set({ freeClipsRemaining: freeClipsRemaining - 1 });
        return true;
      },
      resetClips: () => set({ freeClipsRemaining: FREE_CLIPS_LIMIT }),
    }),
    { name: "clipmaker-auth" }
  )
);
