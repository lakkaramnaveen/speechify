import React from "react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  onToggle(): void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 px-2 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
    >
      {theme === "light" ? "Dark" : "Light"}
    </button>
  );
};

