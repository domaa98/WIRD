"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useWirdState } from "@/lib/storage/useWirdState";

export function ThemeToggle() {
  const { state, updatePrefs, isMounted } = useWirdState();

  if (!isMounted) {
    return <div className="w-9 h-9 rounded-lg" />;
  }

  const currentTheme = state.preferences.theme;
  const isDark =
    currentTheme === "dark" ||
    (currentTheme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    updatePrefs({ theme: isDark ? "light" : "dark" });
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2 rounded-xl transition-colors duration-200 text-deepGreen dark:text-ivory hover:bg-black/5 dark:hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={isDark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      {isDark ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-deepGreen" />}
    </button>
  );
}
