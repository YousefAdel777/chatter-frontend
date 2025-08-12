import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";

type State = {
    theme: Theme;
    setTheme: (theme: Theme) => void
}

export const useThemeStore = create<State>()(persist(set => {
    return {
        theme: "system",
        setTheme: (theme: Theme) => set({ theme })
    }
},  
{ name: "theme" }));