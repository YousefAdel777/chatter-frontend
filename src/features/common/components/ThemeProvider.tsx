"use client"

import { useThemeStore } from "@/store/themeStore";
import { useEffect } from "react";

type Props = {
    children: React.ReactNode;
}

const ThemeProvider: React.FC<Props> = ({ children }) => {

    const { theme } = useThemeStore();

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [theme]);

    return children;
}

export default ThemeProvider;