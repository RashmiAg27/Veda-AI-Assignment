import { create } from 'zustand';

interface ThemeStore {
  dark: boolean;
  toggle: () => void;
  setDark: (v: boolean) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  dark: false,
  toggle: () => set((s) => ({ dark: !s.dark })),
  setDark: (v) => set({ dark: v }),
}));
