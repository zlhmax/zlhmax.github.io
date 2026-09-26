"use client";

import { useState, useEffect } from "react";

/**
 * 主题风格切换开关 —— 滑动式，版式对齐参考站 chopstack.com 的 .theme-switch
 * 结构：button[role=switch] > span.theme-switch__knob > {太阳 svg, 月亮 svg}
 * 位移与图标显隐全部由 CSS 驱动（.dark 选择器）→ 首屏渲染不闪图标。
 * 样式定义在 src/styles/global.css 末尾（.theme-switch / .theme-switch__knob）。
 */

export default function ThemeToggle() {
  const [theme, setThemeState] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved || (prefersDark ? "dark" : "light");
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
    if (initial === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, []);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    if (newTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggleTheme}
      className="theme-switch"
    >
      <span className="theme-switch__knob" aria-hidden="true">
        <svg className="theme-icon-sun" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5 3.5 3.5M20.5 20.5 19 19M19 5l1.5-1.5M3.5 20.5 5 19"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.25" />
        </svg>
        <svg className="theme-icon-moon" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 14.2A7.4 7.4 0 0 1 9.8 4a8.6 8.6 0 1 0 10.2 10.2Z"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
